import React from 'react';
import { PageHeader, Button, Statistic, Row, Tooltip } from 'antd';

import styles from "./PageHeader.module.css";

const StatValue = ({ title, value, description }) => {
  return <Tooltip title={description} placement="bottom">
    <span />
    <Statistic className={styles['stat-block']} title={title} value={`${value}%`} />
  </Tooltip>;
}

const PageHeaderComponent = ({ onRunCalculations, onCreateFilters, kpis }) => {
  return <div className={styles.header}>
    <PageHeader
      title="B2B Presales"
      //onBack={() => {}}
      //subTitle="This is a subtitle"
      extra={[
        <Button key="1" type="primary" onClick={onRunCalculations}>Run Calculations</Button>,
        <Button key="2" type="primary" onClick={onCreateFilters}>Create Filters</Button>,
      ]}>
      <Row className={styles['stat-row']}>
        {kpis['activityEffectiveness'] && <StatValue title="Activity effectiveness" value={kpis['activityEffectiveness']}
          description="Can you keep up in your CRM? - Percentage of open activities that are NOT overdue (100% is best)" />}
        
        {kpis['crmEffectiveness'] && <StatValue title="Planning effectiveness" value={kpis['crmEffectiveness']}
          description="Are you planning activities in your CRM? - Percentage of organisations with open activities (100% is best)" />}
        
        {kpis['crmPerformance'] && <StatValue title="CRM performance" value={kpis['crmPerformance']}
          description="The average of planning effectiveness and activity effectiveness" />}
      </Row>
    </PageHeader>
  </div>
};

export default PageHeaderComponent;