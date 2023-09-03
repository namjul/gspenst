import { z } from "gspenst";

const GspenstConfigSchema = z.object({})

export type GspenstConfig = z.input<typeof GspenstConfigSchema>;
