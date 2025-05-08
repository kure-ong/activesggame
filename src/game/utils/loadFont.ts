export async function loadFont(name: string, url: string): Promise<void> {
  console.log(`🟡 Loading font: ${name} from ${url}`);
  const font = new FontFace(name, `url("${url}")`); // ✅ wrap URL in double quotes
  await font.load();
  document.fonts.add(font);
  console.log(`🟢 Font "${name}" loaded`);
}