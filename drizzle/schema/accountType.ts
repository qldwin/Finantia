import {pgEnum} from "drizzle-orm/pg-core";

export const typeAccountEnum = pgEnum("typeAccountEnum", [
    "courant", "livret_a", "livret_jeune", "pea", "pel","lep", "cel",
    "assurance_vie", "titre", "autre"
])

const labels = {
    courant: "Compte courant",
    livret_a: "Livret A",
    livret_jeune: "Livret Jeune",
    pea: "PEA",
    pel: "PEL",
    lep: "LEP",
    cel: "CEL",
    assurance_vie: "Assurance vie",
    titre: "Titre",
    autre: "Autre"
}