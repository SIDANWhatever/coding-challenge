import { styled } from "@src/stitches.config";

const flexCenter = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}

export const FlexBox = styled("div", {
  ...flexCenter,
})

// UI Elements
export const Input = styled("input", {
  display: "none",
});

export const UploadLabel = styled("label", {
  ...flexCenter,
  width: "140px",
  height: "60px",
  background: "#607D8B",
  borderRadius: "20px",
  color: "#fff",
  fontSize: "25px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    background: "#455A64",
  },
});

export const ProgressBar = styled("div", {
  variants: {
    type: {
      total : {
        position: "absolute",
        left: "0",
        top: "85px",
        height: "2px",
        background: "#607D8B",
        opacity: "1",
        transition: "width 0.3s ease, opacity 0.3s ease",
      },
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
  width: "400px",
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

export const UploadProgressPara = styled("div", {
  ...flexCenter,
  width: "200px",
  margin: "10px 0 0",
  fontSize: "0.8em",
  color: "#617e8c",
});



export const UploadProgressSpan = styled("span", {
  width: "50px",
  paddingRight: "15px",
  display: "flex",
});



export const MaximizeButton = styled("div", {
  position: "absolute",
  right: "25px",
  top: "35px",
  width: "20px",
  height: "20px",
  overflow: "hidden",
  opacity: "0.8",
  transition: "opacity 0.3s ease",

  "&:hover": {
    opacity: "1",
    cursor: "pointer",
  },
});

export const FileProgress = styled("div", {
  display: "flex",
  alignItems: "center",
  width: "100%",
  height: "75px",
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

export const FileDetailsPara = styled("div", {
  paddingRight: "30px",
  position: "relative",
  fontSize: "0.8em",
  height: "25px",
  color: "#565656",
  margin: "10px 0",
  display: "flex",
  alignItems: "center",
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
        maxWidth: "calc(100% - 40px)",
      },
      status: {
        overflow: "hidden",
        height: "20px",
        width: "60px",
        marginRight: "10px",
        float: "left",
      },
    },
  },
});

export const FileActions = styled("div", {
  minWidth: "45px",
  height: "60px",
  display: "flex",
});

export const ActionButton = styled("button", {
  textAlign: "center",
  fontSize: "0.7em",
  color: "#607D8B",
  width: "50px",
  minWidth: "40px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-end",
});

export const ActionSpan = styled("span", {
  ...flexCenter,
  marginTop: "5px"
});

export const SVGBox = styled("div", {
  ...flexCenter,
  width: "100%",
  height: "100%",

  variants: {
    type: {
      action: {
        width: "25px",
        height: "25px",
      },
      indicator: {
        marginRight: "5px",
      },
      ended: {
        width: "20px",
        height: "20px",
        marginRight: "8px",
      }
    },
  },
});
