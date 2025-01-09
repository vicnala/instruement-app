
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id } = await params

  if (!id) return Response.json(
    { message: 'No id provided' },
    { status: 400 }
  )

  try {
    const result = await fetch(`${process.env.INSTRUEMENT_API_URL}/file/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
      }
    })

    const data = await result.json()

    if (data?.code === 'success') {
      return Response.json({ code: 'success', data: data?.data })
    }
    return Response.json(
      { data: { message: data?.message ? data.message : 'Upload error' } },
      { status: 400 }
    )
  } catch (err: any) {
    console.error(`/api/file error`, err)
    return Response.json(
      { data: { message: err.message } },
      { status: 400 }
    )
  }
}