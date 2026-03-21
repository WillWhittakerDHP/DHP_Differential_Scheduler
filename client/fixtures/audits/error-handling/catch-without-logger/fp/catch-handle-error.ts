function handleError(err: unknown) {
  console.error(err)
}

try {
  risky()
} catch (err) {
  handleError(err)
}

function risky() {}
