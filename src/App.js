import React, { useState, useEffect, useCallback } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import { Drawer, Tabs, List, Spin } from 'antd';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import { runCalculations, createFilters, getAllFilters } from './functions';
import { getOrganizations, getOrganizationGroups, getKpis } from './api';
//import { useForceUpdate } from "./hooks";

import PageHeader from "./components/PageHeader";

import 'antd/dist/antd.css'; 
import './App.css';

const { TabPane } = Tabs;

const OrgLink = ({ children, id }) => {
  return <a href={`https://stoked.pipedrive.com/organization/${id}`} target="_blank" className="org-title" rel="noopener noreferrer">{children}</a>;
}

const FilterLink = ({ id, score }) => {
  return <a href={`https://stoked.pipedrive.com/organizations/list/filter/${id}`} className="group-score" target="_blank" rel="noopener noreferrer"
    onClick={e => { 
      e.stopPropagation(); 
      e.nativeEvent.stopImmediatePropagation(); }
    }>{score}</a>;
}

const App = ({ firebaseApp }) => {
  const [organizations, setOrganizations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [kpis, setKpis] = useState({});
  const [filters, setFilters] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(undefined);
  const [expandedGroup, setExpandedGroup] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  //const forceUpdate = useForceUpdate();

  const authUiConfig = {
    signInFlow: 'popup',
    credentialHelper: 'none',
    signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
    callbacks: {
      signInSuccessWithAuthResult(authResult, redirectUrl) {
        if (authResult.additionalUserInfo.isNewUser) {
          firebaseApp.auth().signOut();
        }
      }
    },
  };

  const fetchData = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    const orgs = await getOrganizations();
    setOrganizations(orgs);
    setGroups(getOrganizationGroups(orgs));

    setKpis(await getKpis());
    setFilters(await getAllFilters());

    setIsLoading(false);
  }, [isLoading]);

  useEffect(() => { 
    let unregisterAuthObserver = firebaseApp.auth().onAuthStateChanged((user) => setIsSignedIn(!!user));
    fetchData();
    return unregisterAuthObserver;
  // eslint-disable-next-line 
  }, [firebaseApp]);
  
  return (
    <div className="App">
      {isLoading && isSignedIn && <div className="loader"><Spin /></div>}

      <Drawer
        title="B2B Presales"
        placement={'left'}
        closable={false}
        onClose={() => {}}
        visible={true}
        mask={false}>
      </Drawer>

      {!isSignedIn && 
        <StyledFirebaseAuth className="firebase-ui-auth" uiConfig={authUiConfig}
          firebaseAuth={firebaseApp.auth()} /> }

      {isSignedIn && <div className="content">
        <PageHeader kpis={kpis}
          onRunCalculations={async (e) => {
            setIsLoading(true);
            await runCalculations();
            fetchData();
          }} 
          onCreateFilters={async (e) => {
            await createFilters();
          }}
         />
        
        <div className="tabs">
          <Tabs defaultActiveKey="1" onChange={() => { }}>
            <TabPane tab="Organizations" key="1">
              <List itemLayout="horizontal"
                dataSource={organizations}
                renderItem={item => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      title={<div className="org">
                        <OrgLink id={item.id}><strong>{item.name}</strong></OrgLink>
                        <span className="org-score">{item.score}</span>
                      </div>}
                      //description={item.score}
                    />
                  </List.Item>
                )} />
            </TabPane>

            <TabPane tab="Groups" key="2">
              <List itemLayout="vertical"
                dataSource={groups}
                
                renderItem={(item) => {
                  const filter = filters.find(f => f.name === `b2b-score-${item.score}`);
                  return <List.Item>
                    <List.Item.Meta
                      title={<div className="group" onClick={e => setExpandedGroup(expandedGroup === item.score ? undefined : item.score)}>
                        {filter ? <FilterLink id={filter.id} score={item.score} /> : <span className="group-score">{item.score}</span> }
                        <span className="group-number"><strong>{item.orgs.length}</strong> {item.orgs.length === 1 ? 'organization' : 'organizations'}</span>
                      </div>}
                    />
                    {expandedGroup === item.score && <div>
                      {item.orgs.map(org => (
                        <div key={org.id}>
                          <OrgLink id={org.id}>{org.name}</OrgLink>
                        </div>
                      ))}
                    </div>}
                  </List.Item>
                }} />
            </TabPane>
          </Tabs>
        </div>   
      </div> }
      
    </div>
  );
}

export default App;