import { withCall, withData } from 'spunky';
import { compose, withProps } from 'recompose';
import { pick } from 'lodash';

import authActions from 'login/actions/authActions';

import Encrypt from './Encrypt';
import withClean from '../../../hocs/withClean';
import withNullLoader from '../../../hocs/withNullLoader';

const mapAuthDataToProps = ({ wif }) => ({ wif });
const mapEncryptDataToProps = ({ iv, mac, data }) => ({ iv, mac, data });

const CONFIG_KEYS = ['recipientPublicKey', 'data'];

export default function makeEncrypt(encryptActions) {
  return compose(
    withClean(encryptActions),

    withProps(({ args }) => pick(args[0], CONFIG_KEYS)),

    withData(authActions, mapAuthDataToProps),

    withCall(encryptActions, ({
      recipientPublicKey,
      wif,
      data
    }) => ({
      recipientPublicKey,
      wif,
      data
    })),
    withNullLoader(encryptActions),
    withData(encryptActions, mapEncryptDataToProps)
  )(Encrypt);
}
