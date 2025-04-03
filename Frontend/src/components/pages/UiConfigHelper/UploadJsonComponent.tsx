import React, {useCallback, useEffect, useState} from "react";
import type {ReactNode} from "react";
import _ from "underscore";
import {useDropzone} from "react-dropzone";
import {Avatar, Card, CardContent, Skeleton, Typography} from "@mui/material";
import {FormattedMessage} from "react-intl";
import SvgIcon from "@mui/material/SvgIcon";
import {mdiTrayArrowUp} from "@mdi/js";

interface IUploadJsonComponentProps {
    onUpload: (json: string) => void;
}

export const UploadJsonComponent = (props: IUploadJsonComponentProps) => {
    const [hasFile, setHasFile] = useState<boolean>(false);
    const [fileContent, setFileContent] = useState<string>("");

    const onDrop = useCallback((acceptedFiles: File[]) => {

        /**
         * change the state so loading is displayed
         */
        const file = _(acceptedFiles).first();

        if (!file) throw new Error("unable to find selected file");

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setFileContent(content);
            setHasFile(true);
        };
        reader.readAsText(file);

    }, []);
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        accept: {
            'application/json': []
        },
        maxFiles: 1,
        onDrop
    });

    useEffect(() => {
        if (fileContent !== "") {
            props.onUpload(fileContent);
            setFileContent("");
        }
    }, [fileContent]);

    return <Card elevation={0} className={"image-zone image-zone-bordered"}>

        <CardContent className={"drop-container drop-container-centered"} {...getRootProps()} sx={{height: '100%'}}>
            <><input {...getInputProps()} />
                {!isDragActive ? <DropComponent title={<FormattedMessage id={"Upload Json"}/>}
                                                subTitle={<FormattedMessage id={"Drop here your json file or click this area to choose one."}/>}
                                                icon={<Avatar><SvgIcon>
                                                    <path d={mdiTrayArrowUp}/>
                                                </SvgIcon></Avatar>}/>
                        : <DropComponent title={<FormattedMessage id={"Upload Json"}/>}
                                         subTitle={<FormattedMessage id={"Drop here your json file or click this area to choose one."}/>}
                                         icon={<Avatar sx={{backgroundColor: "primary.main"}}>
                                             <SvgIcon>
                                                 <path d={mdiTrayArrowUp}/>
                                             </SvgIcon></Avatar>}/>
                } </>
        </CardContent></Card>;
};
const DropComponent = ({title, subTitle, icon,}: { title: ReactNode, subTitle: ReactNode, icon: ReactNode }) => {
    return <div className={"drop-content"}>
        {icon}
        <Typography className="drop-content-title" variant={"h4"} color={"text.primary"}>{title}</Typography>
        <div>{subTitle}</div>
    </div>;
};