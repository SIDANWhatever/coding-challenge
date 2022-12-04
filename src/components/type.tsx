// Uploader Interfaces

export interface CustomProgressEvent extends ProgressEvent<EventTarget> {
  percentage: number;
}

type onCompleteType = (e: ProgressEvent<EventTarget>, file: File) => void;
type onErrorType = (e: ProgressEvent<EventTarget>, file: File) => void;
type onProgressType = (
  e: CustomProgressEvent,
  file: File
) => void;
type onAbortType = (e: ProgressEvent<EventTarget>, file: File) => void;

export interface OptionsInterface {
  startingByte: number;
  fileId: string;
  url: string | URL;
  onComplete: onCompleteType;
  onError: onErrorType;
  onProgress: onProgressType;
  onAbort: onAbortType;
}

// Components Interfaces

export interface ProgressTrackerProps {
  files: File[];
}

export interface FileStatus {
  size: number;
  status: string;
  percentage: number;
  uploadedChunkSize: number;
}

export interface UploadSessionProps {
  fileContent: FilesMapContent
}

export interface FilesMapContent {
  file: File,
  fileStatus: FileStatus,
  uploader: {
    retryFileUpload: (file: File) => void,
    abortFileUpload: (file: File) => void,
    resumeFileUpload: (file: File) => void,
    clearFileUpload: (file: File) => void,
  }
}