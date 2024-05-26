export default function (opts) {
  const { ethAddress } = opts;

  function generateRandomisedAddress(address, origin) {
    const hash = crypto.createHash('sha256');
    hash.update(ethAddress);
    hash.update(origin);
    const digest = hash.digest('hex');
    return `0x${digest.slice(0, 40)}`;
  }

  return function addressInjectorMiddleware(req, res, next, end) {
    const { orgin } = req;
    const randomisedAddress = generateRandomisedAddress(ethAddress, origin);
    if (req.method == "eth_getBalance") {
      req.params[0] = ethAddress;
      next();
    } else if (req.method == "eth_sendTransaction") {
      req.params[0].from = ethAddress;
      const rep = req.params[0].data.replace(new RegExp(randomisedAddress, "gi"),
        ethAddress);
      req.params[0].data = rep;
      next();
    } else if (req.method == "eth_call") {
      if (req.params[0].from) {
        req.params[0].from = ethAddress;
      }
      var reg = new RegExp(randomisedAddress, "gi");
      const rep = req.params[0].data.replace(reg,
        ethAddress.replace("0x", ""));
      req.params[0].data = rep;
      next();
    } else if (req.method == 'eth_estimateGas') {
      req.params[0].from = ethAddress;
      next();
    } else if (req.method == 'personal_sign') {
      req.params[1] = ethAddress;
      next();
    } else {
      next();
    }
  }
}
