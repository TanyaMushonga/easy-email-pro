declare module "mjml-browser" {
  interface MjmlError {
    line: number;
    message: string;
    tagName: string;
    formattedMessage: string;
  }

  // mjml-browser v5 returns a Promise
  export default function mjml2html(
    input: string,
    options?: Record<string, unknown>,
  ): Promise<{ html: string; errors: MjmlError[] }>;
}
