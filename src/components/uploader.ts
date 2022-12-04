import { CustomProgressEvent, OptionsInterface } from "./type";

export const ENDPOINTS = {
  UPLOAD: "http://localhost:1234/upload",
  UPLOAD_STATUS: "http://localhost:1234/upload-status",
  UPLOAD_REQUEST: "http://localhost:1234/upload-request",
};

export const uploadFiles = (() => {
  const fileRequests = new WeakMap();
  const defaultOptions = {
    url: ENDPOINTS.UPLOAD,
    startingByte: 0,
    fileId: "",
    onAbort(e: ProgressEvent<EventTarget>, file: File) {},
    onProgress(e: CustomProgressEvent, file: File) {},
    onError(e: ProgressEvent<EventTarget>, file: File) {},
    onComplete(e: ProgressEvent<EventTarget>, file: File) {},
  };

  const uploadFileChunks = (file: File, options: OptionsInterface) => {
    const formData = new FormData();
    const req = new XMLHttpRequest();
    const chunk = file.slice(options.startingByte);

    formData.append("chunk", chunk, file.name);
    formData.append("fileId", options.fileId);

    req.open("POST", options.url, true);
    req.setRequestHeader(
      "Content-Range",
      `bytes=${options.startingByte}-${options.startingByte + chunk.size}/${
        file.size
      }`
    );
    req.setRequestHeader("X-File-Id", options.fileId);

    req.onload = (e) => {
      // it is possible for load to be called when the request status is not 200
      // this will treat 200 only as success and everything else as failure
      if (req.status === 200) {
        options.onComplete(e, file);
      } else {
        options.onError(e, file);
      }
    };

    req.upload.onprogress = (e) => {
      const loaded = options.startingByte + e.loaded;
      options.onProgress(
        {
          ...e,
          loaded,
          total: file.size,
          percentage: (loaded * 100) / file.size,
        },
        file
      );
    };

    req.ontimeout = (e) => options.onError(e, file);

    req.onabort = (e) => options.onAbort(e, file);

    req.onerror = (e) => options.onError(e, file);

    fileRequests.get(file).request = req;

    req.send(formData);
  };

  const uploadFile = (file: File, options: OptionsInterface) => {
    return fetch(ENDPOINTS.UPLOAD_REQUEST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        options = { ...options, ...res };
        fileRequests.set(file, { request: null, options });

        uploadFileChunks(file, options);
      })
      .catch((e) => {
        options.onError({ ...e }, file);
      });
  };

  const abortFileUpload = async (file: File) => {
    const fileReq = fileRequests.get(file);

    if (fileReq && fileReq.request) {
      fileReq.request.abort();
      return true;
    }

    return false;
  };

  const retryFileUpload = (file: File) => {
    const fileReq = fileRequests.get(file);

    if (fileReq) {
      // try to get the status just in case it failed mid upload
      return fetch(
        `${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}&fileId=${fileReq.options.fileId}`
      )
        .then((res) => res.json())
        .then((res) => {
          // if uploaded we continue
          uploadFileChunks(file, {
            ...fileReq.options,
            startingByte: Number(res.totalChunkUploaded),
          });
        })
        .catch(() => {
          // if never uploaded we start
          uploadFileChunks(file, fileReq.options);
        });
    }
  };

  const clearFileUpload = async (file: File) => {
    const fileReq = fileRequests.get(file);

    if (fileReq) {
      await abortFileUpload(file);
      fileRequests.delete(file);

      return true;
    }

    return false;
  };

  const resumeFileUpload = (file: File) => {
    const fileReq = fileRequests.get(file);

    if (fileReq) {
      return fetch(
        `${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}&fileId=${fileReq.options.fileId}`
      )
        .then((res) => res.json())
        .then((res) => {
          uploadFileChunks(file, {
            ...fileReq.options,
            startingByte: Number(res.totalChunkUploaded),
          });
        })
        .catch((e) => {
          fileReq.options.onError({ ...e, file });
        });
    }
  };

  return (files: File[], options = defaultOptions) => {
    [...files].forEach((file) =>
      uploadFile(file, { ...defaultOptions, ...options })
    );

    return {
      abortFileUpload,
      retryFileUpload,
      clearFileUpload,
      resumeFileUpload,
    };
  };
})();
