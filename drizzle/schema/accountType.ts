import {pgEnum} from "drizzle-orm/pg-core";

export const accountTypeEnum = pgEnum("accountTypeEnum", [
    "courant", "livret_a", "livret_jeune", "pea", "pel","lep", "cel",
    "assurance_vie", "titre", "autre"
])