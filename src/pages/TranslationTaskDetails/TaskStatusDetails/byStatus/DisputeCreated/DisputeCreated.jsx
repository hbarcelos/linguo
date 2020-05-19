import React from 'react';
import loadable from '@loadable/component';
import { Dispute } from '~/app/linguo';
import DisputeContext from './DisputeContext';
import { withDisputeFetcher } from './DisputeFetcher';

const componentsByDisputeStatus = {
  waiting: loadable(() => import('./DisputeIsWaiting.jsx')),
  appealable: loadable(() => import('./DisputeHasAppealableRuling/index.js')),
  appealPeriodIsOver: loadable(() => import('./DisputeAppealPeriodIsOver.jsx')),
  solved: loadable(() => Promise.resolve({ default: () => null })),
};

function DisputeCreated() {
  const dispute = React.useContext(DisputeContext);

  let Component;
  if (Dispute.isWaiting(dispute)) {
    Component = componentsByDisputeStatus.waiting;
  } else if (Dispute.isAppealable(dispute)) {
    Component = Dispute.isWithinAppealPeriod(dispute)
      ? componentsByDisputeStatus.appealable
      : componentsByDisputeStatus.appealPeriodIsOver;
  } else {
    console.error('This should not happen!!!!');
    Component = componentsByDisputeStatus.solved;
  }

  return <Component />;
}

export default withDisputeFetcher(DisputeCreated);