import type {ReactNode} from "react";
import React from "react";
// project import
import Navigation from '../navigation/Navigation';
import type {Props} from 'simplebar-react';
import SimpleBar from 'simplebar-react';
import {alpha, styled} from "@mui/material/styles";
import {BrowserView, MobileView} from "react-device-detect";
import type {MUIStyledCommonProps} from "@mui/system";
import type { Theme } from '@mui/material';
import { Box } from '@mui/material';
import "./drawer.scss";

// Insertion of Simplebar
const RootStyle = styled(BrowserView)({
    flexGrow: 1,
    height: "100%",
    overflow: "hidden"
});

const SimpleBarStyle = styled(SimpleBar)(({theme}) => ({
    maxHeight: '100%',
    '& .simplebar-scrollbar': {
        '&:before': {
            backgroundColor: alpha(theme.palette.grey[500], 0.48)
        },
        '&.simplebar-visible:before': {
            opacity: 1
        }
    },
    '& .simplebar-track.simplebar-vertical': {
        width: 10
    },
    '& .simplebar-track.simplebar-horizontal .simplebar-scrollbar': {
        height: 6
    },
    '& .simplebar-mask': {
        zIndex: 'inherit'
    }
}));

const SimpleBarScroll = ({children, sx, ...other}: MUIStyledCommonProps<Theme> & Props) => {
    return (
            <>
                <RootStyle>
                    <SimpleBarStyle timeout={500} clickOnTrack={false} sx={sx} {...other}>
                        {children as ReactNode}
                    </SimpleBarStyle>
                </RootStyle>
                <MobileView>
                    <Box sx={{overflowX: 'auto', ...sx}} {...other}>
                        {children as ReactNode}
                    </Box>
                </MobileView>
            </>
    );
};



// ==============================|| DRAWER CONTENT ||============================== //

const DrawerContent = () => (
  <SimpleBarScroll
    sx={{
      '& .simplebar-content': {
        display: 'flex',
        flexDirection: 'column'
      }
    }}
  >
    <Navigation />
  </SimpleBarScroll>
);

export default DrawerContent;
