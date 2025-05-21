import type {RefObject} from 'react';
import React, {useEffect, useState} from 'react';

// material-ui
import {useOutletContext} from 'react-router';

// material-ui
import type {SelectChangeEvent} from '@mui/material';
import {
    Autocomplete,
    Box,
    Button,
    CardHeader,
    Divider,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField
} from '@mui/material';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';

import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';

// third party
import * as Yup from 'yup';
import {Formik} from 'formik';

// project import
// import { useInputRef } from './index';
import {countries, ABaseApiController, NextBOPublicRegistrationContainer} from '@tcpos/backoffice-core';
import MainCard from '../themeComponents/MainCard';
import {SnackBarCloseAction, NBO_TextField, useAppSelector} from "@tcpos/backoffice-components";
import {rwModes} from "@tcpos/common-core";
import {useIntl} from "react-intl";
import {useSnackbar} from "notistack";

// assets

// styles & constant
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
        }
    }
};

function useInputRef() {
    return useOutletContext<RefObject<HTMLInputElement>>();
}

// ==============================|| TAB - PERSONAL ||============================== //

const TabPersonal = () => {
    const {closeSnackbar, enqueueSnackbar} = useSnackbar();
    const handleChangeDay = (event: SelectChangeEvent<string>, date: Date, setFieldValue: (field: string, value: any) => void) => {
        setFieldValue('dob', new Date(date.setDate(parseInt(event.target.value, 10))));
    };

    const handleChangeMonth = (event: SelectChangeEvent<string>, date: Date, setFieldValue: (field: string, value: any) => void) => {
        setFieldValue('dob', new Date(date.setMonth(parseInt(event.target.value, 10))));
    };

    const user = useAppSelector(state => state.user);
    const [userData, setUserData] =
            useState<{lastName: string, firstName: string}>({lastName: "", firstName: ''});

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 18);

    const apiUrl = useAppSelector(state => state.interfaceConfig.apiUrl);
    const inputRef = useInputRef();
    const intl = useIntl();

    useEffect(() => {
        if (user && user.name) {
            const getPersonalData = async () => {
                const response = await NextBOPublicRegistrationContainer.resolve(ABaseApiController)
                    .apiGet(`${apiUrl}/Operators`, [], {filter: `Code eq '${user.name}'`}, true) as Record<string, unknown>[];
                if (response && response.length) {
                    setUserData({lastName: String(response[0].Description ?? ""), firstName: String(response[0].FirstName ?? "")});
                }
            };
            getPersonalData();
        }
    }, [user]);

    return (
        <MainCard content={false} title="Personal Information" sx={{ '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}>
            <Box sx={{ p: 2.5 }}>
                <NBO_TextField value={userData.lastName} onChange={() => {return;}} error={false} type={""}
                              componentName={"personalData-LastName"} componentId={"personalData-LastName"}
                              label={intl.formatMessage({id: 'Last name'})} rwMode={rwModes.R}
                              bindingGuid={'personalData_LastName'} groupName={""}
                />
                <NBO_TextField value={userData.firstName} onChange={() => {return;}} error={false} type={""}
                              componentName={"personalData-FirstName"} componentId={"personalData-FirstName"}
                              label={intl.formatMessage({id: 'First name'})} rwMode={rwModes.R}
                              bindingGuid={'personalData_LastName'} groupName={""}
                />
            </Box>

            <Formik
                initialValues={{
                    email: '',
                    dob: new Date(),
                    countryCode: '',
                    contact: '',
                    //designation: 'Full Stack Developer',
                    address: '',
                    address1: '',
                    country: '',
                    state: '',
                    note: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.`,
                    submit: null
                }}
                validationSchema={Yup.object().shape({
                    email: Yup.string().email('Invalid email address.').max(255).required('Email is required.'),
                    dob: Yup.date().max(maxDate, 'Age should be 18+ years.')/*.required('Date of birth is requird.')*/,
                    contact: Yup.number()
                        .test('len', 'Contact should be exactly 10 digit', (val) => val?.toString().length === 10)
                        .required('Phone number is required'),
                    //designation: Yup.string().required('Designation is required'),
                    address: Yup.string().min(50, 'Address to short.').required('Address is required'),
                    country: Yup.string().required('Country is required'),
                    state: Yup.string().required('State is required'),
                    note: Yup.string().min(150, 'Not should be more then 150 char.')
                })}
                onSubmit={(values, { setErrors, setStatus, setSubmitting }) => {
                    try {
                        enqueueSnackbar(intl.formatMessage({id: "Personal profile updated successfully"}), {
                            variant: "success",
                            persist: true,
                            action: (snackbarID) => <SnackBarCloseAction snackbarId={snackbarID}/>,
                        });
                        setStatus({ success: false });
                        setSubmitting(false);
                    } catch (err: any) {
                        setStatus({ success: false });
                        setErrors({ submit: err.message });
                        setSubmitting(false);
                    }
                }}
            >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, setFieldValue, touched, values }) => (
                    <form noValidate onSubmit={handleSubmit}>
                        <Box sx={{ p: 2.5 }}>
                            <Grid container spacing={3}>
{/*
                                <Grid item xs={12} sm={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="personal-first-name">First Name</InputLabel>
                                        <TextField
                                            fullWidth
                                            id="personal-first-name"
                                            value={values.firstname}
                                            name="firstname"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            placeholder="First Name"
                                            autoFocus
                                            inputRef={inputRef}
                                        />
                                        {touched.firstname && errors.firstname && (
                                            <FormHelperText error id="personal-first-name-helper">
                                                {errors.firstname}
                                            </FormHelperText>
                                        )}
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="personal-last-name">Last Name</InputLabel>
                                        <TextField
                                            fullWidth
                                            id="personal-last-name"
                                            value={values.lastname}
                                            name="lastname"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            placeholder="Last Name"
                                        />
                                        {touched.lastname && errors.lastname && (
                                            <FormHelperText error id="personal-last-name-helper">
                                                {errors.lastname}
                                            </FormHelperText>
                                        )}
                                    </Stack>
                                </Grid>
*/}
                                <Grid item xs={12} sm={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="personal-email">Email Address</InputLabel>
                                        <TextField
                                            type="email"
                                            fullWidth
                                            value={values.email}
                                            name="email"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            id="personal-email"
                                            placeholder="Email Address"
                                        />
                                        {touched.email && errors.email && (
                                            <FormHelperText error id="personal-email-helper">
                                                {errors.email}
                                            </FormHelperText>
                                        )}
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="personal-date">Date of Birth (+18)</InputLabel>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                            <Select
                                                fullWidth
                                                value={values.dob.getMonth().toString()}
                                                name="dob-month"
                                                onChange={(e: SelectChangeEvent<string>) => handleChangeMonth(e, values.dob, setFieldValue)}
                                            >
                                                <MenuItem value="0">January</MenuItem>
                                                <MenuItem value="1">February</MenuItem>
                                                <MenuItem value="2">March</MenuItem>
                                                <MenuItem value="3">April</MenuItem>
                                                <MenuItem value="4">May</MenuItem>
                                                <MenuItem value="5">June</MenuItem>
                                                <MenuItem value="6">July</MenuItem>
                                                <MenuItem value="7">August</MenuItem>
                                                <MenuItem value="8">September</MenuItem>
                                                <MenuItem value="9">October</MenuItem>
                                                <MenuItem value="10">November</MenuItem>
                                                <MenuItem value="11">December</MenuItem>
                                            </Select>
                                            <Select
                                                fullWidth
                                                value={values.dob.getDate().toString()}
                                                name="dob-date"
                                                onBlur={handleBlur}
                                                onChange={(e: SelectChangeEvent<string>) => handleChangeDay(e, values.dob, setFieldValue)}
                                                MenuProps={MenuProps}
                                            >
                                                {[
                                                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
                                                ].map((i) => (
                                                    <MenuItem
                                                        key={i}
                                                        value={i}
                                                        disabled={
                                                            (values.dob.getMonth() === 1 && i > (values.dob.getFullYear() % 4 === 0 ? 29 : 28)) ||
                                                            (values.dob.getMonth() % 2 !== 0 && values.dob.getMonth() < 7 && i > 30) ||
                                                            (values.dob.getMonth() % 2 === 0 && values.dob.getMonth() > 7 && i > 30)
                                                        }
                                                    >
                                                        {i}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <DatePicker
                                                    views={['year']}
                                                    value={values.dob}
                                                    maxDate={maxDate}
                                                    onChange={(newValue) => {
                                                        setFieldValue('dob', newValue);
                                                    }}
                                                    /*
                                                        renderInput={(params) => <TextField fullWidth {...params} helperText={null} />}
                                                    */
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            helperText: null
                                                        }
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        </Stack>
                                        {touched.dob && errors.dob && (
                                            <FormHelperText error id="personal-dob-helper">
                                                {String(errors.dob)}
                                            </FormHelperText>
                                        )}
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="personal-phone">Phone Number</InputLabel>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                            <Select value={values.countryCode} name="countryCode" onBlur={handleBlur} onChange={handleChange}>
                                                <MenuItem value="+91">+91</MenuItem>
                                                <MenuItem value="1-671">1-671</MenuItem>
                                                <MenuItem value="+36">+36</MenuItem>
                                                <MenuItem value="(225)">(255)</MenuItem>
                                                <MenuItem value="+39">+39</MenuItem>
                                                <MenuItem value="1-876">1-876</MenuItem>
                                                <MenuItem value="+7">+7</MenuItem>
                                                <MenuItem value="(254)">(254)</MenuItem>
                                                <MenuItem value="(373)">(373)</MenuItem>
                                                <MenuItem value="1-664">1-664</MenuItem>
                                                <MenuItem value="+95">+95</MenuItem>
                                                <MenuItem value="(264)">(264)</MenuItem>
                                            </Select>
                                            <TextField
                                                fullWidth
                                                id="personal-contact"
                                                value={values.contact}
                                                name="contact"
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                placeholder="Contact Number"
                                            />
                                        </Stack>
                                        {touched.contact && errors.contact && (
                                            <FormHelperText error id="personal-contact-helper">
                                                {errors.contact}
                                            </FormHelperText>
                                        )}
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Box>
                        <CardHeader title="Address" />
                        <Divider />
                        <Box sx={{ p: 2.5 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="personal-addrees1">Address 01</InputLabel>
                                        <TextField
                                            multiline
                                            rows={3}
                                            fullWidth
                                            id="personal-addrees1"
                                            value={values.address}
                                            name="address"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            placeholder="Address 01"
                                        />
                                        {touched.address && errors.address && (
                                            <FormHelperText error id="personal-address-helper">
                                                {errors.address}
                                            </FormHelperText>
                                        )}
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="personal-addrees2">Address 02</InputLabel>
                                        <TextField
                                            multiline
                                            rows={3}
                                            fullWidth
                                            id="personal-addrees2"
                                            value={values.address1}
                                            name="address1"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            placeholder="Address 02"
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="personal-country">Country</InputLabel>
                                        <Autocomplete
                                            id="personal-country"
                                            fullWidth
                                            value={countries.filter((item) => item.code === values?.country)[0]}
                                            onBlur={handleBlur}
                                            onChange={(event, newValue) => {
                                                setFieldValue('country', newValue === null ? '' : newValue.code);
                                            }}
                                            options={countries}
                                            autoHighlight
                                            isOptionEqualToValue={(option, value) => option.code === value?.code}
                                            getOptionLabel={(option) => option.label}
                                            renderOption={(props, option) => (
                                                <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                                                    {option.code && (
                                                        <img
                                                            loading="lazy"
                                                            width="20"
                                                            src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                                                            srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                                                            alt=""
                                                        />
                                                    )}
                                                    {option.label}
                                                    {option.code && `(${option.code}) ${option.phone}`}
                                                </Box>
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Choose a country"
                                                    name="country"
                                                    inputProps={{
                                                        ...params.inputProps,
                                                        autoComplete: 'new-password' // disable autocomplete and autofill
                                                    }}
                                                />
                                            )}
                                        />
                                        {touched.country && errors.country && (
                                            <FormHelperText error id="personal-country-helper">
                                                {errors.country}
                                            </FormHelperText>
                                        )}
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack spacing={1.25}>
                                        <InputLabel htmlFor="personal-state">State</InputLabel>
                                        <TextField
                                            fullWidth
                                            id="personal-state"
                                            value={values.state}
                                            name="state"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            placeholder="State"
                                        />
                                        {touched.state && errors.state && (
                                            <FormHelperText error id="personal-state-helper">
                                                {errors.state}
                                            </FormHelperText>
                                        )}
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Box>
                        <CardHeader title="Note" />
                        <Divider />
                        <Box sx={{ p: 2.5 }}>
                            <TextField
                                multiline
                                rows={5}
                                fullWidth
                                value={values.note}
                                name="note"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                id="personal-note"
                                placeholder="Note"
                            />
                            {touched.note && errors.note && (
                                <FormHelperText error id="personal-note-helper">
                                    {errors.note}
                                </FormHelperText>
                            )}
                            <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 2.5 }}>
                                <Button variant="outlined" color="secondary">
                                    Cancel
                                </Button>
                                <Button disabled={isSubmitting || Object.keys(errors).length !== 0} type="submit" variant="contained">
                                    Save
                                </Button>
                            </Stack>
                        </Box>
                    </form>
                )}
            </Formik>
        </MainCard>
    );
};

export default TabPersonal;
