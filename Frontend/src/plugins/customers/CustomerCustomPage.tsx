import React, {useState} from "react";
import MainCard from "../../components/themeComponents/MainCard";
import Avatar from "../../components/themeComponents/@extended/Avatar";
import {Link as RouterLink, useParams} from "react-router-dom";
import {WD_BoundTextField, WD_BoundCheckBox} from "@tcpos/backoffice-components";
import {rwModes} from "@tcpos/common-core";
import type {ButtonProps, ChipProps, IconButtonProps, SliderProps} from '@mui/material';
import {
    Box,
    Button,
    Card,
    CardHeader,
    Grid,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme
} from '@mui/material';
import type {LoadingButtonProps} from '@mui/lab';
import type {Theme} from '@mui/material/styles';


import avatarImage from "../../assets/images/users/avatar-2.png";
import type {IRawCRUDWrapperDataUpdate} from "@tcpos/backoffice-components";
import {useAppDispatch, useAppSelector} from "@tcpos/backoffice-components";
import {setObjectData} from "@tcpos/backoffice-core";

type ColorProps =
        | ChipProps['color']
        | ButtonProps['color']
        | LoadingButtonProps['color']
        | IconButtonProps['color']
        | SliderProps['color'];

interface Data {
    name: string;
    carbs: number;
    fat: number;
    tracking_no: number;
    protein: number;
}

type Order = 'asc' | 'desc';

interface HeadCell {
    disablePadding: boolean;
    id: keyof Data;
    label: string;
    align: 'center' | 'left' | 'right' | 'inherit' | 'justify' | undefined;
}

interface OrderTableHeadProps {
    order: Order;
    orderBy: string;
}

interface Props {
    status: number;
}

interface DotProps {
    color?: ColorProps;
    size?: number;
    variant?: string;
}


export const CustomerCustomPage = React.memo(() => {

    const theme = useTheme();
    const {objectId} = useParams();

    const [order] = useState<Order>('asc');
    const [orderBy] = useState<keyof Data>('tracking_no');

    const entityDataContext = useAppSelector(state =>
            state.dataObjectSlice.objects.find(el => el.objectName === 'customerTest' && el.objectId === objectId));
    /*
        const entityDataContext = useEntityDataContext(state =>
            state.objects.find(el => el.objectName === 'customerTest' && el.objectId === objectId));
    */
    const dispatch = useAppDispatch();

    function createData(tracking_no: number, name: string, fat: number, carbs: number, protein: number): Data {
        return {tracking_no, name, fat, carbs, protein};
    }

    const rows = [
        createData(84564564, 'Camera Lens', 40, 2, 40570),
        createData(98764564, 'Laptop', 300, 0, 180139),
        createData(98756325, 'Mobile', 355, 1, 90989),
        createData(98652366, 'Handset', 50, 1, 10239),
        createData(13286564, 'Computer Accessories', 100, 1, 83348),
        createData(86739658, 'TV', 99, 0, 410780),
        createData(13256498, 'Keyboard', 125, 2, 70999),
        createData(98753263, 'Mouse', 89, 2, 10570),
        createData(98753275, 'Desktop', 185, 1, 98063),
        createData(98753291, 'Chair', 100, 0, 14001)
    ];

    function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    const onUpdate = (modifiedData?: IRawCRUDWrapperDataUpdate[]) => {
        if (entityDataContext) {
            const tmpData = [...entityDataContext.objectData];
            if (modifiedData) {
                modifiedData.forEach(m => {
                    const modifiedField = tmpData.find(el => el.entityName === m.entityName && el.entityId === m.entityId)?.data;
                    if (modifiedField) {
                        (modifiedField as Record<string, unknown>)[m.fieldName] = m.value;
                    }
                });
            }
            dispatch(setObjectData({
                objectName: 'customerTest',
                objectId: objectId ?? "",
                newDataObject: tmpData,
            }));

        }
    };

    function getComparator<Key extends keyof any>(
            order: Order,
            orderBy: Key
    ): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
        return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
    }

    function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
        const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) {
                return order;
            }
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    }

    // ==============================|| ORDER TABLE - HEADER CELL ||============================== //


    const headCells: readonly HeadCell[] = [
        {
            id: 'tracking_no',
            align: 'left',
            disablePadding: false,
            label: 'Tracking No.'
        },
        {
            id: 'name',
            align: 'left',
            disablePadding: true,
            label: 'Product Name'
        },
        {
            id: 'fat',
            align: 'right',
            disablePadding: false,
            label: 'Total Order'
        },
        {
            id: 'carbs',
            align: 'left',
            disablePadding: false,

            label: 'Status'
        },
        {
            id: 'protein',
            align: 'right',
            disablePadding: false,
            label: 'Total Amount'
        }
    ];

// ==============================|| ORDER TABLE - HEADER ||============================== //


    function OrderTableHead({order, orderBy}: OrderTableHeadProps) {
        return (
                <TableHead>
                    <TableRow>
                        {headCells.map((headCell) => (
                                <TableCell
                                        key={headCell.id}
                                        align={headCell.align}
                                        padding={headCell.disablePadding ? 'none' : 'normal'}
                                        sortDirection={orderBy === headCell.id ? order : false}
                                >
                                    {headCell.label}
                                </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
        );
    }

    const getColors = (theme: Theme, color?: ColorProps) => {
        switch (color!) {
            case 'secondary':
                return theme.palette.secondary;
            case 'error':
                return theme.palette.error;
            case 'warning':
                return theme.palette.warning;
            case 'info':
                return theme.palette.info;
            case 'success':
                return theme.palette.success;
            default:
                return theme.palette.primary;
        }
    };

    const Dot = ({color, size, variant}: DotProps) => {
        const theme = useTheme();
        const colors = getColors(theme, color || 'primary');
        const {main} = colors;

        return (
                <Box
                        component="span"
                        sx={{
                            width: size || 8,
                            height: size || 8,
                            borderRadius: '50%',
                            bgcolor: variant === 'outlined' ? '' : main,
                            ...(variant === 'outlined' && {
                                border: `1px solid ${main}`
                            })
                        }}
                />
        );
    };

    const OrderStatus = ({status}: Props) => {
        let color: ColorProps;
        let title: string;

        switch (status) {
            case 0:
                color = 'warning';
                title = 'Pending';
                break;
            case 1:
                color = 'success';
                title = 'Approved';
                break;
            case 2:
                color = 'error';
                title = 'Rejected';
                break;
            default:
                color = 'primary';
                title = 'None';
        }
        return (
                <Stack direction="row" spacing={1} alignItems="center">
                    <Dot color={color}/>
                    <Typography>{title}</Typography>
                </Stack>
        );
    };

    return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <form>
                        <MainCard
                                title={"Customer Detail"}
                                content={false}
                                secondary={
                                    <>
                                        <Button variant={'contained'} color={'primary'}>
                                            Save
                                        </Button>
                                    </>
                                }
                        >
                            <Box sx={{marginLeft: '10px', marginRight: '10px'}}>
                                <Grid container spacing={5}>
                                    <Grid item xs={12} md={6}>
                                        <WD_BoundTextField
                                                objectName={'customerTest'}
                                                objectId={objectId ?? '-1'}
                                                entityName={'Customers'}
                                                entityId={objectId ?? '-1'}
                                                componentName={'TestName'}
                                                componentId={'TestName'}
                                                type={'string'}
                                                label={'Customer name'}
                                                rwMode={rwModes.W}
                                                fieldName={'Name'}
                                                groupName={'MainDefinitions'}
                                        />
                                        <Box
                                                sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px'}}>
                                            <Avatar alt="Avatar 1" src={avatarImage}
                                                    sx={{width: 124, height: 124, border: '0'}}/>
                                        </Box>
                                        <WD_BoundTextField
                                                objectName={'customerTest'}
                                                objectId={objectId ?? '-1'}
                                                entityName={'Customers'}
                                                entityId={objectId ?? '-1'}
                                                componentName={'TestCode'}
                                                componentId={'TestCode'}
                                                type={'string'}
                                                label={'Code'}
                                                rwMode={rwModes.W}
                                                fieldName={'Id'}
                                                groupName={'MainDefinitions'}
                                        />
                                        <WD_BoundCheckBox
                                                objectName={'customerTest'}
                                                objectId={objectId ?? '-1'}
                                                entityName={'Customers'}
                                                entityId={objectId ?? '-1'}
                                                componentName={'TestCardValid'}
                                                componentId={'TestCardValid'}
                                                type={'boolean'}
                                                label={'Card valid'}
                                                rwMode={rwModes.W}
                                                fieldName={'CardValid'}
                                                groupName={'MainDefinitions'}
                                                bindingGuid={""}
                                        />
                                        <WD_BoundTextField
                                                objectName={'customerTest'}
                                                objectId={objectId ?? '-1'}
                                                entityName={'Customers'}
                                                entityId={objectId ?? '-1'}
                                                componentName={'TestCardNumber'}
                                                componentId={'TestCardNumber'}
                                                type={'string'}
                                                label={'Card number'}
                                                rwMode={rwModes.W}
                                                fieldName={'CardNumber'}
                                                groupName={'MainDefinitions'}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Box>
                                            <Card>
                                                <CardHeader title={'Order list'}/>
                                                <TableContainer
                                                        sx={{
                                                            width: '100%',
                                                            overflowX: 'auto',
                                                            position: 'relative',
                                                            display: 'block',
                                                            maxWidth: '100%',
                                                            '& td, & th': {whiteSpace: 'nowrap'}
                                                        }}
                                                >
                                                    <Table
                                                            aria-labelledby="tableTitle"
                                                            sx={{
                                                                '& .MuiTableCell-root:first-of-type': {
                                                                    pl: 2
                                                                },
                                                                '& .MuiTableCell-root:last-child': {
                                                                    pr: 3
                                                                }
                                                            }}
                                                    >
                                                        <OrderTableHead order={order} orderBy={orderBy}/>
                                                        <TableBody>
                                                            {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
                                                                const labelId = `enhanced-table-checkbox-${index}`;

                                                                return (
                                                                        <TableRow
                                                                                hover
                                                                                role="checkbox"
                                                                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                                                                tabIndex={-1}
                                                                                key={row.tracking_no}
                                                                        >
                                                                            <TableCell component="th" id={labelId} scope="row"
                                                                                       align="left">
                                                                                <Link color="secondary" component={RouterLink}
                                                                                      to="">
                                                                                    {row.tracking_no}
                                                                                </Link>
                                                                            </TableCell>
                                                                            <TableCell align="left">{row.name}</TableCell>
                                                                            <TableCell align="right">{row.fat}</TableCell>
                                                                            <TableCell align="left">
                                                                                <OrderStatus status={row.carbs}/>
                                                                            </TableCell>
                                                                            <TableCell align="right">
                                                                                {row.protein}
                                                                                {/*<NumberFormat value={row.protein} displayType="text" thousandSeparator prefix="$" />*/}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>

                                            </Card>
                                        </Box>

                                    </Grid>
                                </Grid>
                            </Box>
                        </MainCard>
                    </form>
                </Grid>
            </Grid>
    );
});