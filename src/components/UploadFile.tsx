import { useState, useEffect } from "react";
import {
  Input,
  ProgressBar,
  ProgressBox,
  UploadHeader,
  UploadProgressPara,
  UploadProgressSpan,
  MaximizeButton,
  SVGBox,
  FileDetails,
  FileDetailsPara,
  FileDetailsSpan,
  FileProgress,
  FileActions,
  ActionButton,
} from "./UIComponents";
import { uploadFiles } from "./uploader";

const FILE_STATUS = {
  PENDING: "pending",
  UPLOADING: "uploading",
  PAUSED: "paused",
  COMPLETED: "completed",
  FAILED: "failed",
};

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

interface ProgressTrackerProps {
  files: File[];
}

interface FileStatus {
  size: number;
  status: string;
  percentage: number;
  uploadedChunkSize: number;
}

const ProgressTracker = ({ files }: ProgressTrackerProps) => {
  const [filesMap, setFilesMap] = useState<Map<string, FileStatus>>(new Map());

  useEffect(() => {
    files.forEach((file) => {
      setFilesMap(() => {
        const newMap = filesMap.set(file.name, {
          size: file.size,
          status: FILE_STATUS.PENDING,
          percentage: 0,
          uploadedChunkSize: 0,
        });
        return newMap;
      });
    });
    console.log("FileMaps: ", filesMap);
  }, [files]);

  const [maxButtonFocused, setMaxButtonFocused] = useState(false);
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [pausedCount, setPausedCount] = useState(0);

  const onComplete = (e, file: File) => {
    const fileObj = filesMap.get(file.name);

    fileObj.status = FILE_STATUS.COMPLETED;
    fileObj.percentage = 100;

    // updateFileElement(fileObj);
  };

  const onProgress = (e, file: File) => {
    const fileObj = filesMap.get(file.name);

    fileObj.status = FILE_STATUS.UPLOADING;
    fileObj.percentage = e.percentage;
    fileObj.uploadedChunkSize = e.loaded;

    setFilesMap(() => {
      const newMap = filesMap.set(file.name, fileObj);
      return newMap;
    });

    // updateFileElement(fileObj);
  };

  const onError = (e, file: File) => {
    const fileObj = filesMap.get(file.name);

    fileObj.status = FILE_STATUS.FAILED;
    fileObj.percentage = 100;

    setFilesMap(() => {
      const newMap = filesMap.set(file.name, fileObj);
      return newMap;
    });

    // updateFileElement(fileObj);
  };

  const onAbort = (e, file: File) => {
    const fileObj = filesMap.get(file.name);

    fileObj.status = FILE_STATUS.PAUSED;

    setFilesMap(() => {
      const newMap = filesMap.set(file.name, fileObj);
      return newMap;
    });

    // updateFileElement(fileObj);
  };

  const handleUpload = uploadFiles(files, {
    onProgress,
    onError,
    onAbort,
    onComplete,
  });

  const retryFileUpload = handleUpload.retryFileUpload;
  const abortFileUpload = handleUpload.abortFileUpload;
  const resumeFileUpload = handleUpload.resumeFileUpload;
  const clearFileUpload = handleUpload.clearFileUpload;

  return (
    <ProgressBox>
      <UploadHeader>Uploading {files.length} Files</UploadHeader>
      <UploadProgressPara>
        <UploadProgressSpan>{uploadPercentage}%</UploadProgressSpan>
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
      <ProgressBar css={{ width: `${uploadPercentage}%` }}></ProgressBar>
      {files.map((file) => (
        <div key={file.name}>
          <UploadSession
            file={file}
            // fileStatus={filesMap.get(file.name)}
            retryFileUpload={retryFileUpload}
            abortFileUpload={abortFileUpload}
            resumeFileUpload={resumeFileUpload}
            clearFileUpload={clearFileUpload}
          />
        </div>
      ))}
    </ProgressBox>
  );
};

interface UploadSessionProps {
  file: File;
  // fileStatus: FileStatus;
  retryFileUpload: (file: File) => void;
  abortFileUpload: (file: File) => void;
  resumeFileUpload: (file: File) => void;
  clearFileUpload: (file: File) => void;
}

const UploadSession = ({
  file,
  // fileStatus,
  retryFileUpload,
  abortFileUpload,
  resumeFileUpload,
  clearFileUpload,
}: UploadSessionProps) => {
  const extIndex = file.name.lastIndexOf(".");
  // const uploadedPercentage: string = fileStatus?.percentage.toString() + "%" || "0%";
  // console.log("Individual file status", fileStatus);
  

  return (
    <FileProgress>
      <FileDetails>
        <FileDetailsPara>
          <FileDetailsSpan type="status">pending</FileDetailsSpan>
          <FileDetailsSpan type="fileName">
            {file.name.substring(0, extIndex)}
          </FileDetailsSpan>
          <FileDetailsSpan type="fileExt">
            {file.name.substring(extIndex)}
          </FileDetailsSpan>
        </FileDetailsPara>
        <ProgressBar type="individual" css={{ width: "100%" }}></ProgressBar>
      </FileDetails>
      <FileActions>
        <ActionButton
          onClick={() => {
            retryFileUpload(file);
          }}>
          Retry
        </ActionButton>
        <ActionButton
          onClick={() => {
            abortFileUpload(file);
          }}>
          Pause
        </ActionButton>
        <ActionButton
          onClick={() => {
            resumeFileUpload(file);
          }}>
          Resume
        </ActionButton>
        <ActionButton
          onClick={() => {
            clearFileUpload(file);
          }}>
          Clear
        </ActionButton>
      </FileActions>
    </FileProgress>
  );
};
