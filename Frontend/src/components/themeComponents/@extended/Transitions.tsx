import {forwardRef} from "react";
import PropTypes from 'prop-types';
import {Box, Fade, Grow} from "@mui/material";
import React from "react";
//import type {BoxProps} from "@mui/material";

/*
interface ITransitionsProps extends BoxProps {
    type: string;
}
*/

const Transitions = forwardRef<HTMLDivElement, any>(({children, position, type, ...others}, ref) => {
    let positionSX = {
        transformOrigin: '0 0 0'
    };

    switch (position) {
        case 'top-right':
        case 'top':
        case 'bottom-left':
        case 'bottom-right':
        case 'bottom':
        case 'top-left':
        default:
            positionSX = {
                transformOrigin: '0 0 0'
            };
            break;
    }

    return (
            <Box ref={ref}>
                {type === 'grow' && (
                        <Grow {...others}>
                            <Box sx={positionSX}>{children}</Box>
                        </Grow>
                )}
                {type === 'fade' && (
                        <Fade
                                {...others}
                                timeout={{
                                    appear: 0,
                                    enter: 300,
                                    exit: 150
                                }}
                        >
                            <Box sx={positionSX}>{children}</Box>
                        </Fade>
                )}
            </Box>
    );
});

Transitions.propTypes = {
    children: PropTypes.node,
    type: PropTypes.oneOf(['grow', 'fade', 'collapse', 'slide', 'zoom']),
    position: PropTypes.oneOf(['top-left', 'top-right', 'top', 'bottom-left', 'bottom-right', 'bottom'])
};

Transitions.defaultProps = {
    type: 'grow',
    position: 'top-left'
};

export default Transitions;
