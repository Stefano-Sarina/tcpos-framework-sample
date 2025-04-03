import React, {useEffect, useState} from 'react';
import {FormattedMessage, FormattedNumber, useIntl} from 'react-intl';
import {setLogged, store, DailyPublicRegistrationContainer} from "@tcpos/backoffice-core";
import logoIcon from '../../../assets/images/logo-tcposDaily.png';
import logoIconDark from '../../../assets/images/logo-tcposDaily_dark1.png';

// material-ui
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Grid,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';

// project import
import AnalyticEcommerce from './AnalyticEcommerce';
import MainCard from '../../themeComponents/MainCard';
import IncomeAreaChart from './IncomeAreaChart';
import MonthlyBarChart from './MonthlyBarChart';
import ReportAreaChart from './ReportAreaChart';
import OrdersTable from './OrdersTable';
import SalesChart from './SalesChart';
import { GiftOutlined, MessageOutlined, SettingOutlined } from '@ant-design/icons';
import avatar1 from '../../../assets/images/users/avatar-1.png';
import avatar2 from '../../../assets/images/users/avatar-2.png';
import avatar3 from '../../../assets/images/users/avatar-3.png';
import avatar4 from '../../../assets/images/users/avatar-4.png';

import {useTheme} from "@mui/material/styles";
import {ADailyApiClient} from "@tcpos/backoffice-core";
/*
import {WD_TreeContainer} from "../../components/WD_TreeContainer/WD_TreeContainer";
import {rwModes} from "@tcpos/common-core";
*/

// avatar style
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

// action style
const actionSX = {
  mt: 0.75,
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// sales report status
const status = [
  {
    value: 'today',
    label: 'Today'
  },
  {
    value: 'month',
    label: 'This Month'
  },
  {
    value: 'year',
    label: 'This Year'
  }
];

// ==============================|| DASHBOARD - DEFAULT ||============================== //

const DashboardDefault = () => {
  const theme = useTheme();
  const intl = useIntl();
  const [value, setValue] = useState('today');
  const [slot, setSlot] = useState('week');
  const apiClient = DailyPublicRegistrationContainer.resolve(ADailyApiClient);
  const dispatch = store.dispatch;
  let response: any;

  useEffect(() => {
      // Fake api call to check if the operator is logged in
      const getUserinfo = async () => {
          try {
              response = await apiClient.get('/connect/userinfo', {}, false, true);
              dispatch(setLogged({logged: true, name: response ?? ""})); // This function also sets initialized = true
          } catch {
              dispatch(setLogged({logged: false})); // This function also sets initialized = true
          }
      };
      getUserinfo();
  }, []);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/*       
        <Grid item xs={12} sx={{
          display: 'flex',
          overflow: "visible",
          flex: "1 0 auto",
          maxHeight: 'calc(100vh - 90px)'
        }}>
          <Box sx={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img className="logo logo-image" src={theme.palette.mode === 'dark' ? logoIconDark : logoIcon} alt="TCPos"
                style={{maxHeight: '100%', maxWidth: '100%'}}
                />
          </Box>
        </Grid>
      */}      
      {/* row 1 */}
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5"><FormattedMessage id={'Dashboard'} /></Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
      <AnalyticEcommerce
                title={intl.formatMessage({id: 'New customer cards in the last week'})}
            count={intl.formatNumber(4236)} percentage={5.3} extra={intl.formatNumber(35000)} />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title={intl.formatMessage({id: "Total customers"})}
            count={intl.formatNumber(178250)} percentage={7.5} extra={intl.formatNumber(88900)} />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title={intl.formatMessage({id: "Total Orders"})}
                           count={intl.formatNumber(18800)}
                           percentage={27.4} isLoss color="warning"
                           extra={intl.formatNumber(1943)} />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title={intl.formatMessage({id: "Total Sales"})}
                           count={intl.formatNumber(35078, {style: 'currency', currency: 'EUR'})}
                           percentage={27.4}
                           isLoss
                           color="warning" extra={intl.formatNumber(20395, {style: 'currency', currency: 'EUR'})} />
      </Grid>

      <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />

      {/* row 2 */}
      <Grid item xs={12} md={7} lg={8}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5"><FormattedMessage id={'Unique Visitors'} /></Typography>
          </Grid>
          <Grid item>
            <Stack direction="row" alignItems="center" spacing={0}>
              <Button
                size="small"
                onClick={() => setSlot('month')}
                color={slot === 'month' ? 'primary' : 'secondary'}
                variant={slot === 'month' ? 'outlined' : 'text'}
              >
                  <FormattedMessage id={'Month'} />
              </Button>
              <Button
                size="small"
                onClick={() => setSlot('week')}
                color={slot === 'week' ? 'primary' : 'secondary'}
                variant={slot === 'week' ? 'outlined' : 'text'}
              >
                  <FormattedMessage id={'Week'} />
              </Button>
            </Stack>
          </Grid>
        </Grid>
        <MainCard content={false} sx={{ mt: 1.5 }}>
          <Box sx={{ pt: 1, pr: 2 }}>
            <IncomeAreaChart slot={slot} />
          </Box>
        </MainCard>
      </Grid>
      <Grid item xs={12} md={5} lg={4}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5"><FormattedMessage id={'Income Overview'} /></Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Stack spacing={2}>
              <Typography variant="h6" color="textSecondary">
                  <FormattedMessage id={'This Week Statistics'} />
              </Typography>
              <Typography variant="h3"><FormattedNumber value={7650} style={'currency'} currency={'EUR'} /></Typography>
            </Stack>
          </Box>
          <MonthlyBarChart />
        </MainCard>
      </Grid>

      {/* row 3 */}
      <Grid item xs={12} md={7} lg={8}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5"><FormattedMessage id={'Recent Orders'} /></Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <OrdersTable />
        </MainCard>
      </Grid>
      <Grid item xs={12} md={5} lg={4}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5"><FormattedMessage id={'Analytics Report'} /></Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <List sx={{ p: 0, '& .MuiListItemButton-root': { py: 2 } }}>
            <ListItemButton divider>
              <ListItemText primary={intl.formatMessage({id: "Company Finance Growth"})} />
              <Typography variant="h5"><FormattedNumber value={45.14} style={'percent'} signDisplay={'exceptZero'} />
              </Typography>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemText primary={intl.formatMessage({id: "Company Expenses Ratio"})} />
              <Typography variant="h5"><FormattedNumber value={0.58} style={'percent'} signDisplay={'exceptZero'} />
              </Typography>
            </ListItemButton>
            <ListItemButton>
              <ListItemText primary={intl.formatMessage({id: "Business Risk Cases"})} />
              <Typography variant="h5">{intl.formatMessage({id: "Low"})}</Typography>
            </ListItemButton>
          </List>
          <ReportAreaChart />
        </MainCard>
      </Grid>

      {/* row 4 */}
      <Grid item xs={12} md={7} lg={8}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">{intl.formatMessage({id: "Sales Report"})}</Typography>
          </Grid>
          <Grid item>
            <TextField
              id="standard-select-currency"
              size="small"
              select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              sx={{ '& .MuiInputBase-input': { py: 0.75, fontSize: '0.875rem' } }}
            >
              {status.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <SalesChart />
      </Grid>
      <Grid item xs={12} md={5} lg={4}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5"><FormattedMessage id={'Transaction History'} /></Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <List
            component="nav"
            sx={{
              px: 0,
              py: 0,
              '& .MuiListItemButton-root': {
                py: 1.5,
                '& .MuiAvatar-root': avatarSX,
                '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
              }
            }}
          >
            <ListItemButton divider>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    color: 'success.main',
                    bgcolor: 'success.lighter'
                  }}
                >
                  <GiftOutlined />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={<Typography variant="subtitle1"><FormattedMessage id={'Order'} />{' #002434'}</Typography>}
                            secondary={intl.formatMessage({id: "Today"}) + ", " +
                                    intl.formatDate(new Date(new Date().getFullYear(), new Date().getMonth(),
                                            new Date().getDay(), 2, 0, 0),
                                            {hour: 'numeric', minute: 'numeric'})}  />
              <ListItemSecondaryAction>
                <Stack alignItems="flex-end">
                  <Typography variant="subtitle1" noWrap>
                      <FormattedNumber value={1430} style={'currency'} currency={'EUR'} signDisplay={'exceptZero'} />
                  </Typography>
                  <Typography variant="h6" color="secondary" noWrap>
                      <FormattedNumber value={78} style={'percent'} />
                  </Typography>
                </Stack>
              </ListItemSecondaryAction>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    color: 'primary.main',
                    bgcolor: 'primary.lighter'
                  }}
                >
                  <MessageOutlined />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={<Typography variant="subtitle1"><FormattedMessage id={'Order'} />{' #984947'}</Typography>} secondary="5 August, 1:45 PM" />
              <ListItemSecondaryAction>
                <Stack alignItems="flex-end">
                  <Typography variant="subtitle1" noWrap>
                      <FormattedNumber value={302} style={'currency'} currency={'EUR'} signDisplay={'exceptZero'} />
                  </Typography>
                  <Typography variant="h6" color="secondary" noWrap>
                      <FormattedNumber value={8} style={'percent'} />
                  </Typography>
                </Stack>
              </ListItemSecondaryAction>
            </ListItemButton>
            <ListItemButton>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    color: 'error.main',
                    bgcolor: 'error.lighter'
                  }}
                >
                  <SettingOutlined />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={<Typography variant="subtitle1"><FormattedMessage id={'Order'} />{' #988784'}</Typography>} secondary="7 hours ago" />
              <ListItemSecondaryAction>
                <Stack alignItems="flex-end">
                  <Typography variant="subtitle1" noWrap>
                      <FormattedNumber value={682} style={'currency'} currency={'EUR'} signDisplay={'exceptZero'} />
                  </Typography>
                  <Typography variant="h6" color="secondary" noWrap>
                      <FormattedNumber value={16} style={'percent'} />
                  </Typography>
                </Stack>
              </ListItemSecondaryAction>
            </ListItemButton>
          </List>
        </MainCard>
        <MainCard sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Stack>
                  <Typography variant="h5" noWrap>
                      <FormattedMessage id={'Help & Support Chat'} />
                  </Typography>
                  <Typography variant="caption" color="secondary" noWrap>
                      <FormattedMessage id={'Typical reply within 5 min'} />
                  </Typography>
                </Stack>
              </Grid>
              <Grid item>
                <AvatarGroup sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                  <Avatar alt="Remy Sharp" src={avatar1} />
                  <Avatar alt="Travis Howard" src={avatar2} />
                  <Avatar alt="Cindy Baker" src={avatar3} />
                  <Avatar alt="Agnes Walker" src={avatar4} />
                </AvatarGroup>
              </Grid>
            </Grid>
            <Button size="small" variant="contained" sx={{ textTransform: 'capitalize' }}>
                <FormattedMessage id={'Need Help?'} />
            </Button>
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default DashboardDefault;
