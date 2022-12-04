import { Clear, Collapse, Completed, CompletedIndicator, Expand, Failed, FailedIndicator, Paused, PausedIndicator, Resume, Retry } from "@src/assets";
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
  SVGBox,
  ActionSpan,
  UploadLabel,
  FlexBox,
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
    <FlexBox css={{flexDirection: "column"}}>
      <UploadLabel id="upload-btn">
        Upload
        <Input
          type="file"
          multiple
          accept="video/*"
          onChange={handleFileChange}
        />
      </UploadLabel>
      <ProgressTracker files={files}/>
    </FlexBox>
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
  const [abortCount, setAbortCount] = useState<number>(0);

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
      uploadedAccumulator += fileContent.fileStatus.uploadedChunkSize;
      uploadingAccumulator += fileContent.fileStatus.size;
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

    files.forEach((file) => {
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
        setAbortCount((prev) => prev + 1);

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

  const ProgressHeader = () => {
    return (
      <>
        <UploadHeader>Uploading {`${pendingCount + uploadingCount}/${filesCount - abortCount}`} Files</UploadHeader>
        <UploadProgressPara>
          <UploadProgressSpan>{Math.floor(uploadedSize/totalSize) || 0}%</UploadProgressSpan>
          <UploadProgressSpan>
            <SVGBox type="indicator"><CompletedIndicator /></SVGBox>
            {successCount}
          </UploadProgressSpan>
          <UploadProgressSpan>
            <SVGBox type="indicator"><FailedIndicator /></SVGBox>
            {failedCount}
          </UploadProgressSpan>
          <UploadProgressSpan>
            <SVGBox type="indicator"><PausedIndicator /></SVGBox>
            {pausedCount}
          </UploadProgressSpan>
        </UploadProgressPara>
        <MaximizeButton
          onClick={() =>
            setMaxButtonFocused((prev: boolean): boolean => {
              return !prev;
            })
          }>
          <SVGBox>
            {maxButtonFocused ? <Collapse /> : <Expand />}
          </SVGBox>
        </MaximizeButton>
        <ProgressBar type="total" css={{width: `${uploadedSize/totalSize}%` }}></ProgressBar>
      </>
    )
  }

  return (
    <ProgressBox>
      {filesCount - abortCount > 0 ? <ProgressHeader /> : "No Upload In Progress"}
      {maxButtonFocused && [...filesMap.values()].map((file) => (
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

  const ShowButton = () => {
    if (fileContent.fileStatus.status === FILE_STATUS.UPLOADING || fileContent.fileStatus.status === FILE_STATUS.PENDING) {
      return (
        <ActionButton
          onClick={() => {
            fileContent.uploader.abortFileUpload(fileContent.file);
          }}>
          <SVGBox type="action">
            <Paused />
          </SVGBox>
          <ActionSpan>
            Pause
          </ActionSpan>
        </ActionButton>
      )
    } else if (fileContent.fileStatus.status === FILE_STATUS.PAUSED) {
      return (
        <ActionButton
          onClick={() => {
            fileContent.uploader.resumeFileUpload(fileContent.file);
          }}>
          <SVGBox type="action">
            <Resume />
          </SVGBox>
          <ActionSpan>
            Resume
          </ActionSpan>
        </ActionButton>
      )
    } else if (fileContent.fileStatus.status === FILE_STATUS.FAILED) {
      return (
        <ActionButton
          onClick={() => {
            fileContent.uploader.retryFileUpload(fileContent.file);
          }}>
          <SVGBox type="action">
            <Retry />
          </SVGBox>
          <ActionSpan>
            Retry
          </ActionSpan>
        </ActionButton>
      )
    } 
    return
  }

  return (
    <FileProgress>
      <FileDetails>
        <FileDetailsPara>
          {fileContent.fileStatus.status === FILE_STATUS.PENDING && <FileDetailsSpan type="status">Pending</FileDetailsSpan>}
          {fileContent.fileStatus.status === FILE_STATUS.COMPLETED && <SVGBox type="ended"><Completed /></SVGBox>}
          {fileContent.fileStatus.status === FILE_STATUS.FAILED && <SVGBox type="ended"><Failed /></SVGBox>}
          <FileDetailsSpan type="fileName">
            {fileContent.file.name.substring(0, extIndex)}
          </FileDetailsSpan>
          <FileDetailsSpan type="fileName">
            {fileContent.file.name.substring(extIndex)}
          </FileDetailsSpan>
          <FileDetailsSpan type="fileName">
            {Math.floor(fileContent.fileStatus.percentage)}%
          </FileDetailsSpan>
        </FileDetailsPara>
        <ProgressBar type="individual" css={{ width: uploadedPercentage }}></ProgressBar>
      </FileDetails>
      <FileActions>
        {ShowButton()}
        <ActionButton
          onClick={() => {
            fileContent.uploader.clearFileUpload(fileContent.file);
          }}>
          <SVGBox type="action">
            <Clear />
          </SVGBox>
          <ActionSpan>
            Clear
          </ActionSpan>
        </ActionButton>
      </FileActions>
    </FileProgress>
  );
};
