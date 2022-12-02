import { styled } from "@src/stitches.config";

// UI Elements
export const Input = styled("input", {
  display: "none",
});

export const ProgressBar = styled("div", {
  position: "absolute",
  left: "0",
  top: "85px",
  height: "2px",
  background: "#607D8B",
  opacity: "1",
  transition: "width 0.3s ease, opacity 0.3s ease",

  variants: {
    type: {
      individual: {
        height: "2px",
        background: "#607D8B",
        position: "absolute",
        bottom: "5px",
        left: "0",
        zIndex: "2",
      },
    },
  },
});

export const ProgressBox = styled("div", {
  background:
    "#ffffff linear-gradient(45deg, #f4edff, #efffef) left center/100% 100% no-repeat",
  width: "800px",
  borderRadius: "10px",
  boxShadow: "0 5px 35px #cdcdcd",
  padding: "25px",
  color: "#565252",
  position: "relative",
  margin: "50px 0",
  transition: "background 0.3s ease",
});

export const UploadHeader = styled("h3", {
  margin: "0",
  fontSize: "1em",
  fontWeight: "normal",
  color: "#222",
});

export const UploadProgressPara = styled("p", {
  margin: "10px 0 0",
  fontSize: "0.8em",
  color: "#617e8c",
});

export const UploadProgressSpan = styled("span", {
  width: "30px",
  paddingRight: "15px",
});

export const MaximizeButton = styled("button", {
  position: "absolute",
  right: "25px",
  top: "35px",
  width: "20px",
  height: "20px",
  overflow: "hidden",
  textIndent: "9999999px",
  opacity: "0.8",
  transition: "opacity 0.3s ease",

  "&:hover": {
    opacity: "1",
  },
});

export const FileProgress = styled("div", {
  display: "flex",
  alignItems: "center",
  width: "100%",
});

export const FileDetails = styled("div", {
  position: "relative",
  flex: "1",
  margin: "5px 5px 5px 0",

  "&::after": {
    content: '""',
    width: "100%",
    height: "2px",
    background: "#ddd",
    display: "block",
    position: "absolute",
    bottom: "5px",
    left: "0",
    zIndex: "1",
  },
});

export const FileDetailsPara = styled("p", {
  paddingRight: "30px",
  position: "relative",
  alignItems: "center",
  fontSize: "0.8em",
  height: "25px",
  color: "#565656",
  margin: "10px 0",
});

export const FileDetailsSpan = styled("span", {
  variants: {
    type: {
      fileName: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        float: "left",
        marginTop: "4px",
        display: "inline-block",
        flex: "1",
        /* 40px off because file status takes max 35px wide plus 5 of gap */
        maxWidth: "calc(100% - 40px)",
      },
      fileExt: {
        marginTop: "4px",
      },
      status: {
        overflow: "hidden",
        textIndent: "-9999999px",
        height: "20px",
        width: "20px",
        marginRight: "10px",
        float: "left",
        "&.uploading": {
          overflow: "hidden",
          textIndent: "-9999999px",
          height: "20px",
          width: "20px",
          marginRight: "10px",
          float: "left",
        },
        "&.failed": {
          background:
            'url("@src/assets/failed.svg") center center/100% 100% no-repeat',
        },
        "&.completed": {
          background:
            'url("@src/assets/completed.svg") center center/100% 100% no-repeat',
        },
        "&.paused": {
          background:
            'url("@src/assets/paused-indicator.svg") center center/100% 100% no-repeat',
          right: "auto",
          left: "0",
        },
      },
    },
  },
});

export const FileActions = styled("div", {
  minWidth: "45px",
  display: "flex",
  justifyContent: "center",
});

export const ActionButton = styled("button", {
  height: "50px",
  textAlign: "center",
  padding: "36px 0 0",
  fontSize: "0.7em",
  color: "#607D8B",
  width: "40px",
  minWidth: "40px",
  marginLeft: "5px",

  "&.clear-btn": {
    background: 'url("@src/assets/clear.svg") center 42%/20px 20px no-repeat',
  },

  "&.retry-btn": {
    background: 'url("@src/assets/retry.svg") center 42%/20px 20px no-repeat',
  },

  "&.pause-btn": {
    background: 'url("@src/assets/pause.svg") center 42%/20px 20px no-repeat',
  },

  "&.resume-btn": {
    background: 'url("@src/assets/resume.svg") center 42%/20px 20px no-repeat',
  },
});

export const SVGBox = styled("div", {
  position: "absolute",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
});
