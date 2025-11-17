export const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`
}
