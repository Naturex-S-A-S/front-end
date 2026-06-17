"use client";

import { useMemo } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";

import { Grid } from "@mui/material";

import CustomTabList from "@/@core/components/mui/TabList";
import { useAbility } from "@/hooks/casl/useAbility";
import { ABILITY_SUBJECT } from "@/utils/constant";

const Tabs = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "Categorias";

  const ability = useAbility();

  const tabs = useMemo(() => {
    return ability.rules
      .filter(rule => rule.subject === ABILITY_SUBJECT.GENERAL_PARAMETERS)
      .map(rule => {
        const allow = ability.can("read", ABILITY_SUBJECT.GENERAL_PARAMETERS, rule.fields?.toString());

        return {
          value: rule.fields?.toString(),
          label: rule.fields?.toString(),
          icon: "tabler-list",
          allow
        };
      });
  }, [ability]);

  const handleChange = (_: any, value: string) => {
    router.replace(`?tab=${value}`);
  };

  return (
    <Grid item xs={12} md={4}>
      <TabContext value={activeTab}>
        <CustomTabList orientation='vertical' onChange={handleChange} className='is-full' pill='true'>
          {tabs.map(tab => {
            if (!tab.allow) return null;

            return (
              <Tab
                key={tab.value}
                className='flex-row justify-start'
                iconPosition='start'
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className={tab.icon} />
                    {tab.label}
                  </div>
                }
                value={tab.value}
              />
            );
          })}
        </CustomTabList>
      </TabContext>
    </Grid>
  );
};

export default Tabs;
