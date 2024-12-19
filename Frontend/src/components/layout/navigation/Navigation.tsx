import React, {useEffect, useState} from 'react';

// material-ui
import {Box, Typography} from '@mui/material';

// types
// project import
import NavGroup from './NavGroup';
import type {IMenuConverter} from '@tcpos/backoffice-core';
import {MenuGroupsConverter} from "./menuGroupsConverter";
import {TCIcon, useAppSelector} from "@tcpos/backoffice-components";
import {useIntl} from "react-intl";

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

const Navigation = () => {
  const intl = useIntl();
  const importViewModel = useAppSelector((state) => state.interfaceConfig);
  const [navGroups, setNavGroups] = useState<JSX.Element[]>([]);

  const menu = useAppSelector(state => state.menu);
  const { drawerOpen } = menu;
  const loadingState = useAppSelector((state) => {
    return state.loadingState ?? [];
  });

  const [menuItems, setMenuItems] = useState<{items: IMenuConverter[]}>({items: []});
  useEffect(() => {
    setMenuItems(MenuGroupsConverter(importViewModel));
  }, [importViewModel]);

    useEffect(() => {
        if (importViewModel.menuLoaded && !loadingState.find(el => !el.completed)) {
            const newNavGroups = menuItems.items.map((item) => {
                switch (item.type) {
                    case 'group':
                        return <NavGroup
                                key={item.id}
                                item={{...item, children: item.children?.map(el => {
                                        return {...el,
                                            icon: () => {return <TCIcon iconCode={'tci-' + el.icon} />;},
                                            url: intl.locale + el.url
                                        };
                                    })}}
                        />;
                    default:
                        return (
                                <Typography key={item.id} variant="h6" color="error" align="center">
                                    Fix - Navigation Group
                                </Typography>
                        );
                }
            });
            setNavGroups(newNavGroups);
        }
    }, [menuItems, importViewModel, intl.locale, loadingState]);
/*
  const navGroups = menuItems.items.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup
                key={item.id}
                item={{...item, children: item.children?.map(el => {
                        return {...el,
                            icon: () => {return <TCIcon iconCode={'tci-' + el.icon} />;},
                            url: intl.locale + el.url
                        };
                    })}}
        />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });
*/

  return <Box sx={{ pt: drawerOpen ? 2 : 0, '& > ul:first-of-type': { mt: 0 } }}>{navGroups}</Box>;
};

export default Navigation;
