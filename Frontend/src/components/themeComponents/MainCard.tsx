import PropTypes from 'prop-types';
import {forwardRef} from 'react';
import type {CSSProperties, ReactNode} from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Card,
    CardContent,
    CardHeader,
    Divider,
    Typography
} from '@mui/material';
import type {
    CardContentProps,
    CardHeaderProps,
    CardProps,
} from '@mui/material';
import React from 'react';
import type {KeyedObject} from "./types";
// header style
const headerSX = {
    p: 2.5,
    '& .MuiCardHeader-action': { m: '0px auto', alignSelf: 'center' }
};

export interface MainCardProps extends KeyedObject {
    border?: boolean;
    boxShadow?: boolean;
    children: ReactNode | string;
    subheader?: ReactNode | string;
    style?: CSSProperties;
    content?: boolean;
    contentSX?: CardContentProps['sx'];
    darkTitle?: boolean;
    divider?: boolean;
    sx?: CardProps['sx'];
    secondary?: CardHeaderProps['action'];
    shadow?: string;
    elevation?: number;
    title?: ReactNode | string;
    modal?: boolean;
}


const MainCard = forwardRef<HTMLDivElement, any>(
        (
                {
                    border = true,
                    boxShadow,
                    children,
                    content = true,
                    contentSX = {},
                    darkTitle,
                    divider = true,
                    elevation,
                    secondary,
                    shadow,
                    sx = {},
                    title,
                    codeHighlight,
                    ...others

                },
                        ref
        ) => {
            const theme = useTheme();
            boxShadow = theme.palette.mode === 'dark' ? boxShadow || true : boxShadow;

            return (
                    <Card
                        elevation = {elevation || 1}
                        ref={ref}
                            {...others}
                        sx={{
                            ...sx,
                            border: border ? '1px solid' : 'none',
                            borderRadius: 2,
                            borderColor:  theme.palette.divider ,
                            '& pre': {
                                m: 0,
                                p: '16px !important',
                                fontFamily: theme.typography.fontFamily,
                                fontSize: '0.75rem'
                            }
                        }}
                    >
                        {!darkTitle && title && (
                                <CardHeader sx={headerSX} titleTypographyProps={{ variant: 'subtitle1' }} title={title} action={secondary} />
                        )}
                        {darkTitle && title && (
                                <CardHeader sx={headerSX} title={<Typography variant="h3">{title}</Typography>} action={secondary} />
                        )}

                        {/* content & header divider */}
                        {title && divider && <Divider />}

                        {/* card content */}
                        {content && <CardContent sx={contentSX}>{children}</CardContent>}
                        {!content && children}


                    </Card>
            );
        }
);

MainCard.propTypes = {
    border: PropTypes.bool,
    boxShadow: PropTypes.bool,
    contentSX: PropTypes.object,
    darkTitle: PropTypes.bool,
    divider: PropTypes.bool,
    elevation: PropTypes.number,
    secondary: PropTypes.node,
    shadow: PropTypes.string,
    sx: PropTypes.object,
    title: PropTypes.string,
    codeHighlight: PropTypes.bool,
    content: PropTypes.bool,
    children: PropTypes.node
};

export default MainCard;
