export async function loadFont(name: string, url: string) {
  const font = new FontFace(name, `url(${url})`);
  await font.load();
  (document as any).fonts.add(font);
}
