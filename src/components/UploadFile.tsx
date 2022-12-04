import { useState, useEffect } from "react";
import { FileStatus, ProgressTrackerProps, UploadSessionProps, CustomProgressEvent, FilesMapContent } from "./type";
import {
  Input,
  ProgressBar,
  ProgressBox,
  UploadHeader,
  UploadProgressPara,
  UploadProgressSpan,
  MaximizeButton,
  FileDetails,
  FileDetailsPara,
  FileDetailsSpan,
  FileProgress,
  FileActions,
  ActionButton,
} from "./UIComponents";
import { ENDPOINTS, uploadFiles } from "./uploader";

const FILE_STATUS = {
  PENDING: "pending",
  UPLOADING: "uploading",
  PAUSED: "paused",
  COMPLETED: "completed",
  FAILED: "failed",
};

const defaultFileStatus = {
  size: 1000000,
  status: FILE_STATUS.PENDING,
  percentage: 0,
  uploadedChunkSize: 0,
}

const UploadFile = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file: FileList | null = e.target.files;
    if (file) {
      setFiles((prev) => [...prev, ...file]);
    }
  };

  useEffect(() => {
    console.log("Uploading for ", files);
  }, [files]);

  return (
    <div>
      <label id="upload-btn">
        upload
        <Input
          type="file"
          multiple
          accept="video/*"
          onChange={handleFileChange}
        />
      </label>
      <ProgressTracker files={files} />
    </div>
  );
};

export default UploadFile;



const ProgressTracker = ({ files }: ProgressTrackerProps) => {
  const [filesMap, setFilesMap] = useState<Map<string, FilesMapContent>>(new Map());
  const [maxButtonFocused, setMaxButtonFocused] = useState<boolean>(false);

  const [uploadedSize, setUploadedSize] = useState<number>(0);
  const [totalSize, setTotalSize] = useState<number>(0);

  const [pendingCount, setPendingCount] = useState<number>(0);
  const [uploadingCount, setUploadingCount] = useState<number>(0);
  const [pausedCount, setPausedCount] = useState<number>(0);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [failedCount, setFailedCount] = useState<number>(0);
  const [filesCount, setFilesCount] = useState<number>(0);

  const refreshPage = (): void => {
    const newFilesCount = files.length;
    let uploadedAccumulator: number = 0;
    let uploadingAccumulator: number = 0;
    let pending: number = 0;
    let uploading: number = 0;
    let success: number = 0;
    let failed: number = 0;
    let paused: number = 0;

    filesMap.forEach((fileContent) => {
      uploadedAccumulator += fileContent.fileStatus.size;
      uploadingAccumulator += fileContent.fileStatus.uploadedChunkSize;
      if (fileContent.fileStatus.status === FILE_STATUS.COMPLETED) {
        success += 1;
      } else if (fileContent.fileStatus.status === FILE_STATUS.FAILED) {
        failed += 1;
      } else if (fileContent.fileStatus.status === FILE_STATUS.PAUSED) {
        paused += 1;
      } else if (fileContent.fileStatus.status === FILE_STATUS.UPLOADING) {
        uploading += 1;
      } else if (fileContent.fileStatus.status === FILE_STATUS.PENDING) {
        pending += 1;
      }
    })

    setUploadedSize(uploadedAccumulator);
    setTotalSize(uploadingAccumulator);
    setPausedCount(paused);
    setSuccessCount(success);
    setFailedCount(failed);
    setUploadingCount(uploading);
    setPendingCount(pending);
    setFilesCount(newFilesCount);

    console.log("uploaded", uploadedAccumulator);
    console.log("uploading", uploadingAccumulator);
  
  }

  useEffect(() => {
    files.forEach((file) => {

      const onComplete = (_: ProgressEvent<EventTarget>, file: File): void => {
        const fileObj = filesMap.get(file.name);
        if (fileObj) {
          fileObj.fileStatus.status = FILE_STATUS.COMPLETED;
          fileObj.fileStatus.percentage = 100;
    
          setFilesMap(() => {
            const newMap = filesMap.set(file.name, fileObj);
            return newMap;
          });
        }
        refreshPage();
        console.log(" request completed ");
      };
    
      const onProgress = (e: CustomProgressEvent, file: File): void => {
        const fileObj = filesMap.get(file.name);
        if (fileObj) {
          fileObj.fileStatus.status = FILE_STATUS.UPLOADING;
    
          if (e.percentage) {
            fileObj.fileStatus.percentage = e.percentage;
          }
          fileObj.fileStatus.uploadedChunkSize = e.loaded;
    
          setFilesMap(() => {
            const newMap = filesMap.set(file.name, fileObj);
            return newMap;
          });
        }
        // updateFileElement(fileObj);
    
        console.log(" request progress ", e, fileObj);
        refreshPage();
      };
    
      const onError = (_: ProgressEvent<EventTarget>, file: File): void => {
        const fileObj = filesMap.get(file.name);
    
        if (fileObj) {
          fileObj.fileStatus.status = FILE_STATUS.FAILED;
          fileObj.fileStatus.percentage = 100;
      
          setFilesMap(() => {
            const newMap = filesMap.set(file.name, fileObj);
            return newMap;
          });
        }
        refreshPage();
        // updateFileElement(fileObj);
      };
    
      const onAbort = (_: ProgressEvent<EventTarget>, file: File): void => {
        const fileObj = filesMap.get(file.name);
        if (fileObj) {
          fileObj.fileStatus.status = FILE_STATUS.PAUSED;
      
          setFilesMap(() => {
            const newMap = filesMap.set(file.name, fileObj);
            return newMap;
          });
        }
        refreshPage();
        // updateFileElement(fileObj);
      };
    
      const handleUpload = uploadFiles(files, {
        url: ENDPOINTS.UPLOAD,
        startingByte: 0,
        fileId: "",
        onComplete: onComplete,
        onError: onError,
        onProgress: onProgress,
        onAbort: onAbort,
      });
      
      const retryFileUpload = handleUpload.retryFileUpload;
      const abortFileUpload = handleUpload.abortFileUpload;
      const resumeFileUpload = handleUpload.resumeFileUpload;
      const clearFileUpload = async (file: File) => {
        const cleared = await handleUpload.clearFileUpload(file);

        const newMap = filesMap;
        const deleted = newMap.delete(file.name);
        if (deleted) {
          setFilesMap(newMap);
        }
        refreshPage();
        
        if (cleared) {
          return true
        }
        return false
      }

      setFilesMap(() => {
        const newMap = filesMap.set(file.name, {
          file: file,
          fileStatus: {
            ...defaultFileStatus, size: file.size
          },
          uploader: {
            retryFileUpload: retryFileUpload,
            abortFileUpload: abortFileUpload,
            resumeFileUpload: resumeFileUpload,
            clearFileUpload: clearFileUpload,
          }
        });
        return newMap;
      });
    });
    console.log("FileMaps: ", filesMap);
  }, [files]);

  return (
    <ProgressBox>
      <UploadHeader>Uploading {`${pendingCount + uploadingCount}/${filesCount}`} Files</UploadHeader>
      <UploadProgressPara>
        <UploadProgressSpan>{uploadedSize/totalSize || 0}%</UploadProgressSpan>
        <UploadProgressSpan>{successCount}</UploadProgressSpan>
        <UploadProgressSpan>{failedCount}</UploadProgressSpan>
        <UploadProgressSpan>{pausedCount}</UploadProgressSpan>
      </UploadProgressPara>
      <MaximizeButton
        type="button"
        onClick={() =>
          setMaxButtonFocused((prev: boolean): boolean => {
            return !prev;
          })
        }>
        Maximized
      </MaximizeButton>
      {[...filesMap.values()].map((file) => (
        <div key={file.file.name}>          
          <UploadSession
            fileContent={file}
          />
        </div>
      ))}
    </ProgressBox>
  );
};



const UploadSession = ({
  fileContent
}: UploadSessionProps) => {
  const extIndex = fileContent.file.name.lastIndexOf(".");
  const uploadedPercentage: string = fileContent.fileStatus.percentage.toString() + "%" || "0%";

  return (
    <FileProgress>
      <FileDetails>
        <FileDetailsPara>
          <FileDetailsSpan type="status">pending</FileDetailsSpan>
          <FileDetailsSpan type="fileName">
            {fileContent.file.name.substring(0, extIndex)}
          </FileDetailsSpan>
          <FileDetailsSpan type="fileExt">
            {fileContent.file.name.substring(extIndex)}
          </FileDetailsSpan>
        </FileDetailsPara>
        <div>{fileContent.fileStatus.size}</div>
        <div>{fileContent.fileStatus.percentage}</div>
        <div>{fileContent.fileStatus.status}</div>
        <div>{fileContent.fileStatus.uploadedChunkSize}</div>
        <ProgressBar type="individual" css={{ width: uploadedPercentage }}></ProgressBar>
      </FileDetails>
      <FileActions>
        <ActionButton
          onClick={() => {
            fileContent.uploader.retryFileUpload(fileContent.file);
          }}>
          Retry
        </ActionButton>
        <ActionButton
          onClick={() => {
            fileContent.uploader.abortFileUpload(fileContent.file);
          }}>
          Pause
        </ActionButton>
        <ActionButton
          onClick={() => {
            fileContent.uploader.resumeFileUpload(fileContent.file);
          }}>
          Resume
        </ActionButton>
        <ActionButton
          onClick={() => {
            fileContent.uploader.clearFileUpload(fileContent.file);
          }}>
          Clear
        </ActionButton>
      </FileActions>
    </FileProgress>
  );
};
