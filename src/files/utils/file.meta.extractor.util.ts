export type FileMetaExtractorUtilReturnType =
  | {
      fieldname: string;
      filename: string;
      contentType: string;
    }
  | undefined;

export default (chunk: string): FileMetaExtractorUtilReturnType => {
  const match = chunk.match(
    /Content-Disposition:.*name="(.*)";.*filename="(.*)"(?:\r\n|\n)Content-Type: (.*)/,
  );
  if (!match) return;
  const [, fieldname, filename, contentType] = match;
  return {
    fieldname,
    filename,
    contentType,
  };
};
