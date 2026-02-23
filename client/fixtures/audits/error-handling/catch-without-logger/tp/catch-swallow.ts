let failed = false
try {
  mightThrow()
} catch {
  failed = true
}

function mightThrow() {}
