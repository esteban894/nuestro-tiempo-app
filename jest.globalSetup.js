// Pins the test process to UTC so date assertions don't depend on the machine's zone
// (a developer in Argentina, a Windows box, CI). Set here, before Jest forks its
// workers, because assigning process.env.TZ inside a test only changes the sandbox's
// copy of env. Tests that need other zones pass them explicitly.
module.exports = () => {
  process.env.TZ = "UTC";
};
