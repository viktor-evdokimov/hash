import { SvgIcon, SvgIconProps } from "@mui/material";
import { FunctionComponent } from "react";

export const QuickNoteIcon: FunctionComponent<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} width="18" height="17" viewBox="0 0 18 17" fill="none">
      <path
        d="M12.9004 13.7997C13.4629 13.7997 13.9004 13.3309 13.9004 12.7997V2.79968C13.9004 2.23718 13.4629 1.79968 12.9004 1.79968H6.40039V4.79968C6.40039 5.61218 5.74414 6.29968 4.90039 6.29968H1.90039V12.7997C1.90039 13.3309 2.36914 13.7997 2.90039 13.7997H12.9004ZM5.40039 2.20593L2.33789 5.29968H4.90039C5.18164 5.29968 5.40039 5.04968 5.40039 4.79968V2.20593ZM14.9004 12.7997C13.7695 13.7997 13.7695 13.7997 12.6016 14.7997H2.90039C1.80664 14.7997 0.900391 13.8934 0.900391 12.7997V6.11218C0.900391 5.58093 1.11914 5.08093 1.49414 4.70593L4.83789 1.36218C5.21289 0.987183 5.71289 0.799683 6.24414 0.799683H12.9004C14.0254 0.799683 14.9004 1.67468 14.9004 2.79968V12.7997Z"
        fill="#91A5BA"
      />
      <path
        d="M15.8301 5.35437L14.9065 9.57312H16.6504C16.9551 9.57312 17.2363 9.76062 17.3535 10.0419C17.4473 10.3466 17.377 10.6747 17.1426 10.8856L11.1426 16.1356C10.8613 16.3466 10.4863 16.37 10.2051 16.1591C9.92383 15.9716 9.80665 15.5966 9.94727 15.2684L11.001 11.0497H9.1504C8.82227 11.0497 8.54102 10.8622 8.44727 10.5809C8.33008 10.2762 8.4004 9.94812 8.63477 9.73718L14.6348 4.48718C14.916 4.27624 15.291 4.25281 15.5723 4.46374C15.8535 4.65124 15.9707 5.02624 15.8301 5.35437Z"
        fill="currentColor"
      />
    </SvgIcon>
  );
};