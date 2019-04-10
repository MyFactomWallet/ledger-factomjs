import testFctTxMultiOut from "./testFctTxMultiOut";

function expectAppContext(appName) {
  // TODO improve this by waiting user to do an action?
  return {
    expectAppContext: true,
    appName
  };
}

var tests = [
  expectAppContext("Factom (fct)"),
  { name: "testFctTxMultiOut", run: testFctTxMultiOut },
];

const defaultWaitForAppSwitch = step =>
  new Promise(resolve => {
    var s = 3;
    console.info(
      "You have " + s + " seconds to switch to " + step.appName + " app ..."
    );
    var interval = setInterval(() => {
      if (--s) {
        console.log(s + " ...");
      } else {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });

export default async (
  getTransportClass,
  timeout = 5000,
  waitForAppSwitch = defaultWaitForAppSwitch
) => {
  async function createTransportViaList(Transport) {
    const descriptors = await Transport.list();
    if (descriptors.length === 0) throw "No device found";
    return await Transport.open(descriptors[0], timeout);
  }
  async function createTransportViaListen(Transport) {
    const descriptor = await new Promise((success, failure) => {
      let t;
      const subscription = Transport.listen({
        next: e => {
          if (e.type === "add") {
            subscription.unsubscribe();
            success(e.descriptor);
            clearTimeout(t);
          }
        },
        error: error => {
          failure(error);
          clearTimeout(t);
        },
        complete: () => {
          failure("terminated too early");
          clearTimeout(t);
        }
      });
      t = setTimeout(() => {
        subscription.unsubscribe();
        failure("timeout");
      }, timeout);
    });
    return await Transport.open(descriptor, timeout);
  }
  async function createTransportViaCreate(Transport) {
    return await Transport.create(timeout);
  }

  return tests.reduce(async (p, step, i) => {
    await p;
    if (step.expectAppContext) {
      await waitForAppSwitch(step);
      return;
    }
    const Transport = getTransportClass(step);
    const supported = await Transport.isSupported();
    if (!supported) {
      throw new Error("Transport.isSupported() is false");
    }
    // this will alternate between one of the 3 ways to create a transport
    const createTransport = [
      createTransportViaCreate,
      createTransportViaList,
      createTransportViaListen
    ][i % 3];
    let transport = await createTransport(Transport);
    transport.setDebugMode(true);

    if (step.name) {
      console.info("Running test " + step.name);
    }
    try {
      const result = await step.run(transport);
      if (result) {
        console.log(result);
      }
    } catch (err) {
      console.error("Failed test " + step.name + ":", err);
      throw err;
    } finally {
      transport.close();
    }
  }, Promise.resolve());
};
