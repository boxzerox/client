import { createActions } from 'spunky';
import { wallet, api } from '@cityofzion/neon-js';
import { mapKeys } from 'lodash';

import createScript from 'shared/util/createScript';
import formatAssets from 'shared/util/formatAssets';
import { ASSETS } from 'shared/values/assets';

import generateDAppActionId from './generateDAppActionId';
import validateInvokeArgs from '../util/validateInvokeArgs';

export const ID = 'invoke';

async function doInvoke({
  net,
  address,
  wif,
  publicKey,
  signingFunction,
  scriptHash,
  operation,
  args,
  encodeArgs,
  assets
}) {
  validateInvokeArgs({ scriptHash, operation, args, assets });

  const config = {
    net,
    address,
    script: createScript(scriptHash, operation, args, encodeArgs),
    privateKey: wif,
    publicKey,
    signingFunction,
    gas: 0
  };

  if (assets) {
    const scAddress = wallet.getAddressFromScriptHash(scriptHash);
    const intentConfig = mapKeys(formatAssets(assets), (value, key) => ASSETS[key].symbol);
    config.intents = api.makeIntent(intentConfig, scAddress);
  }

  const { response: { result, txid } } = await api.doInvoke(config);

  if (!result) {
    throw new Error('Invocation failed.');
  }

  return txid;
}

export default function makeInvokeActions(sessionId, requestId) {
  const id = generateDAppActionId(sessionId, `${ID}-${requestId}`);

  return createActions(id, ({
    net,
    address,
    wif,
    publicKey,
    signingFunction,
    scriptHash,
    operation,
    args,
    assets,
    encodeArgs = true
  }) => () => doInvoke({
    net,
    address,
    wif,
    publicKey,
    signingFunction,
    scriptHash,
    operation,
    args,
    assets,
    encodeArgs
  }));
}
