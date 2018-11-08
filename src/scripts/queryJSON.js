export default function getQueryJSON(viewModel) {
  let x = {
    version: 1.0,
    record_ids: [],
    segments: [],
    conditions: {
    }
  };
  return JSON.stringify(x, null, 4);
}
