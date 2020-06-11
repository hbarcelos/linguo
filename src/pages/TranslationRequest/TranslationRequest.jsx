import React from 'react';
import { useWeb3React } from '~/features/web3';
import LinguoApiReadyGateway from '~/components/LinguoApiReadyGateway';
import RequiredWalletGateway from '~/features/web3/RequiredWalletGateway';
import WithRouteMessage from '~/components/WithRouteMessage';
import ContentBlocker from '~/components/ContentBlocker';
import SingleCardLayout from '../layouts/SingleCardLayout';
import TranslationRequestForm from './TranslationRequestForm';

function TranslationRequest() {
  const { account } = useWeb3React();
  const formBlocked = !account;

  const form = (
    <ContentBlocker blocked={formBlocked}>
      <TranslationRequestForm />
    </ContentBlocker>
  );

  return (
    <SingleCardLayout title="Request Translation">
      <LinguoApiReadyGateway>
        <WithRouteMessage>
          <RequiredWalletGateway
            message="To request a translation you need an Ethereum wallet."
            missing={form}
            error={form}
          >
            {form}
          </RequiredWalletGateway>
        </WithRouteMessage>
      </LinguoApiReadyGateway>
    </SingleCardLayout>
  );
}

export default TranslationRequest;
