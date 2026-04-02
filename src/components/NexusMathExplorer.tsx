import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flame, Dna, Binary, Orbit, Globe, Grid3x3, Swords, Bitcoin, Zap, Layers, Search, BookOpen } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  Flame: <Flame className="w-5 h-5" />,
  Dna: <Dna className="w-5 h-5" />,
  Binary: <Binary className="w-5 h-5" />,
  Orbit: <Orbit className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  Grid3x3: <Grid3x3 className="w-5 h-5" />,
  Swords: <Swords className="w-5 h-5" />,
  Bitcoin: <Bitcoin className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
};

interface Variable { [key: string]: string }
interface Formula {
  id: string; name: string; latex: string; description: string;
  variables: Variable; tags: string[];
}
interface Category {
  id: string; name: string; icon: string; description: string; formulas: Formula[];
}

const CATEGORIES: Category[] = [
  {
    id: "chaos", name: "Chaostheorie", icon: "Flame",
    description: "Komplexe dynamische Systeme, empfindlich auf Anfangsbedingungen.",
    formulas: [
      { id: "logistic-map", name: "Logistische Abbildung", latex: "x_{n+1} = r · x_n(1 - x_n)", description: "Polynomielle Abbildung — komplexes chaotisches Verhalten aus einfachen nichtlinearen Gleichungen.", variables: { "x_n": "Populationsverhältnis im Schritt n", "r": "Wachstumsrate (0 < r ≤ 4)" }, tags: ["chaos", "logistic", "bifurcation"] },
      { id: "lyapunov", name: "Lyapunov-Exponent", latex: "λ = lim(N→∞) 1/N Σ ln|f'(x_i)|", description: "Rate der Separation infinitesimal naher Trajektorien.", variables: { "λ": "Lyapunov-Exponent", "f'(x_i)": "Ableitung am Punkt x_i", "N": "Iterationen" }, tags: ["chaos", "lyapunov"] },
      { id: "lorenz", name: "Lorenz-Attraktor", latex: "dx/dt = σ(y-x), dy/dt = x(ρ-z)-y, dz/dt = xy - βz", description: "System von ODEs mit chaotischen Lösungen — atmosphärische Konvektion.", variables: { "σ": "Prandtl-Zahl", "ρ": "Rayleigh-Zahl", "β": "Geometrischer Faktor" }, tags: ["chaos", "lorenz", "ode"] },
      { id: "feigenbaum", name: "Feigenbaum-Konstante", latex: "δ = lim(n→∞) (a_{n-1} - a_{n-2})/(a_n - a_{n-1}) = 4.669201...", description: "Universelle Konstante für Periodenverdopplungskaskaden.", variables: { "δ": "Feigenbaum-Konstante", "a_n": "Parameterwert bei n-ter Bifurkation" }, tags: ["chaos", "feigenbaum"] },
    ]
  },
  {
    id: "omnigenesis", name: "Omnigenese", icon: "Dna",
    description: "Genetische Vererbung komplexer Merkmale und Krankheiten.",
    formulas: [
      { id: "omnigenic", name: "Omnigenic Liability Modell", latex: "y = Σ(core) β_i·g_i + Σ(periph) β_j·g_j + ε", description: "Alle exprimierten Gene tragen zur Heritabilität bei.", variables: { "y": "Phänotypische Anfälligkeit", "β_i": "Kerngen-Effekt", "ε": "Umweltrauschen" }, tags: ["omnigenesis", "genetics"] },
      { id: "heritability", name: "Heritabilitäts-Partitionierung", latex: "h² = σ²_G / σ²_P", description: "Zerlegung in Kern- und Peripherie-Komponenten.", variables: { "h²": "Heritabilität", "σ²_G": "Genetische Varianz", "σ²_P": "Phänotypische Varianz" }, tags: ["omnigenesis", "heritability"] },
    ]
  },
  {
    id: "info-theory", name: "Informationstheorie", icon: "Binary",
    description: "Messung, Speicherung und Übertragung von Informationen.",
    formulas: [
      { id: "shannon", name: "Shannon-Entropie", latex: "H(X) = -Σ p(x)·log₂(p(x))", description: "Informationsgehalt einer Quelle in Bits.", variables: { "H": "Entropie", "p(x)": "Wahrscheinlichkeit von x" }, tags: ["shannon", "entropy"] },
      { id: "kolmogorov", name: "Kolmogorov-Komplexität", latex: "K(x) = min{|p| : U(p) = x}", description: "Kürzestes Programm das x erzeugt.", variables: { "K": "Komplexität", "U": "Universelle Turingmaschine" }, tags: ["kolmogorov", "complexity"] },
      { id: "private-key", name: "Private Key Entropie", latex: "H(d) = log₂(N) ≈ 256 bits", description: "Entropie eines SECP256k1 Private Keys.", variables: { "N": "Kurvenordnung", "d": "Private Key" }, tags: ["entropy", "secp256k1"] },
    ]
  },
  {
    id: "string-theory", name: "Stringtheorie", icon: "Orbit",
    description: "Elementarteilchen als eindimensionale Strings.",
    formulas: [
      { id: "nambu-goto", name: "Nambu-Goto-Aktion", latex: "S = -T ∫ d²σ √(-det(g_αβ))", description: "Aktion für relativistischen String, proportional zur Weltfläche.", variables: { "S": "Aktion", "T": "Stringspannung", "g_αβ": "Induzierte Metrik" }, tags: ["string", "nambu-goto"] },
      { id: "polyakov", name: "Polyakov-Aktion", latex: "S_P = -T/2 ∫ d²σ √(-h) h^αβ ∂_αX^μ ∂_βX_μ", description: "Gleichwertige String-Aktion mit unabhängiger Weltflächenmetrik.", variables: { "h_αβ": "Weltflächenmetrik", "X^μ": "Raumzeit-Einbettung" }, tags: ["string", "polyakov"] },
    ]
  },
  {
    id: "cosmology", name: "Kosmologie", icon: "Globe",
    description: "Physik des Universums — Entstehung, Expansion und Struktur.",
    formulas: [
      { id: "friedmann", name: "Friedmann-Gleichung", latex: "H² = 8πG/3·ρ - k/a² + Λ/3", description: "Expansionsrate des Universums.", variables: { "H": "Hubble-Parameter", "ρ": "Energiedichte", "Λ": "Kosmologische Konstante" }, tags: ["friedmann", "expansion"] },
      { id: "einstein", name: "Einstein-Feldgleichungen", latex: "G_μν + Λg_μν = 8πG/c⁴ T_μν", description: "Raumzeit-Geometrie ↔ Materie-Energie.", variables: { "G_μν": "Einstein-Tensor", "T_μν": "Energie-Impuls-Tensor" }, tags: ["einstein", "field-equations"] },
      { id: "hawking", name: "Hawking-Temperatur", latex: "T_H = ℏc³/(8πGMk_B)", description: "Strahlung von Schwarzen Löchern.", variables: { "T_H": "Hawking-Temperatur", "M": "Masse des Schwarzen Lochs" }, tags: ["hawking", "black-hole"] },
    ]
  },
  {
    id: "lattice", name: "Gitter-Kryptanalyse", icon: "Grid3x3",
    description: "Post-Quanten-Sicherheit und gitterbasierte Kryptographie.",
    formulas: [
      { id: "lwe", name: "Learning With Errors", latex: "b = ⟨a, s⟩ + e (mod q)", description: "Grundlage vieler Post-Quanten-Kryptosysteme.", variables: { "a": "Zufallsvektor", "s": "Geheimer Vektor", "e": "Fehlerterm" }, tags: ["lwe", "post-quantum"] },
      { id: "svp", name: "SVP Approximation", latex: "||v|| ≤ γ(n)·λ₁(L)", description: "Shortest Vector Problem — vermutlich hart.", variables: { "γ(n)": "Approximationsfaktor", "λ₁(L)": "Kürzeste Vektorlänge" }, tags: ["svp", "lattice"] },
    ]
  },
  {
    id: "attacks", name: "Angriffsalgorithmen", icon: "Swords",
    description: "Quantenangriffe und klassische Kryptanalyse.",
    formulas: [
      { id: "grover", name: "Grover-Algorithmus", latex: "O(√N) vs O(N) klassisch", description: "Quadratische Beschleunigung für Suchprobleme.", variables: { "N": "Suchraum-Größe" }, tags: ["quantum", "grover"] },
      { id: "shor", name: "Shor-Algorithmus", latex: "r: a^r ≡ 1 (mod N)", description: "Primfaktorzerlegung in Polynomialzeit — bedroht RSA.", variables: { "r": "Periode", "N": "Zu faktorisierende Zahl" }, tags: ["quantum", "shor", "rsa"] },
      { id: "birthday", name: "Birthday Attack", latex: "P(collision) ≈ 1 - e^(-n²/(2H))", description: "Geburtstagsparadoxon für Hash-Kollisionen.", variables: { "n": "Samples", "H": "Hash-Ausgaberaum" }, tags: ["birthday", "collision"] },
    ]
  },
  {
    id: "bitcoin", name: "Bitcoin", icon: "Bitcoin",
    description: "Kryptographische Grundlagen von Bitcoin.",
    formulas: [
      { id: "pow", name: "Hashcash PoW", latex: "SHA256(SHA256(header)) < 2^224/D", description: "Proof-of-Work Mining-Algorithmus.", variables: { "header": "Block Header", "D": "Schwierigkeit" }, tags: ["bitcoin", "pow", "mining"] },
      { id: "ecdsa", name: "ECDSA Signatur", latex: "s = k⁻¹(z + r·d_A) mod n", description: "Elliptic Curve Signaturen für Transaktionen.", variables: { "s": "Signatur", "k": "Nonce", "d_A": "Private Key" }, tags: ["bitcoin", "ecdsa"] },
      { id: "difficulty", name: "Difficulty Adjustment", latex: "D_new = D_old × T_actual / T_target", description: "Mining-Schwierigkeit alle 2016 Blöcke.", variables: { "D": "Schwierigkeit", "T_target": "2 Wochen" }, tags: ["bitcoin", "difficulty"] },
    ]
  },
  {
    id: "entropy", name: "Entropie-Kollaps", icon: "Zap",
    description: "Entropie-Analyse und Sicherheit.",
    formulas: [
      { id: "min-entropy", name: "Min-Entropie", latex: "H_∞(X) = -log₂ max_x p(x)", description: "Konservativstes Entropiemaß.", variables: { "H_∞": "Min-Entropie", "p(x)": "Wahrscheinlichstes Ergebnis" }, tags: ["entropy", "security"] },
      { id: "leftover-hash", name: "Leftover Hash Lemma", latex: "SD(h(X), U_m) ≤ ½√(2^(m-H_∞(X)))", description: "Universelle Hash → nahezu gleichverteilter Output.", variables: { "SD": "Statistische Distanz", "m": "Output-Länge" }, tags: ["hash", "entropy"] },
    ]
  },
  {
    id: "complexity", name: "Komplexitätsklassen", icon: "Layers",
    description: "Fundamentale Grenzen der Berechenbarkeit.",
    formulas: [
      { id: "p-vs-np", name: "P vs NP", latex: "P ⊆ NP, P =? NP", description: "Wichtigstes offenes Problem der Informatik.", variables: { "P": "Polynomialzeit lösbar", "NP": "Polynomialzeit verifizierbar" }, tags: ["complexity", "p-np"] },
      { id: "bqp", name: "BQP", latex: "BPP ⊆ BQP ⊆ PSPACE", description: "Quantencomputer-Komplexitätsklasse.", variables: { "BQP": "Bounded-error quantum polynomial" }, tags: ["complexity", "quantum"] },
      { id: "cook-levin", name: "Cook-Levin Theorem", latex: "SAT ∈ NP-complete ⟹ ∀L∈NP, L ≤_p SAT", description: "SAT ist NP-vollständig.", variables: { "SAT": "Boolesche Erfüllbarkeit", "≤_p": "Polynomielle Reduktion" }, tags: ["complexity", "sat", "np-complete"] },
    ]
  },
];

export const NexusMathExplorer = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);

  const filteredCategories = useMemo(() => {
    if (!search.trim() && !selectedCategory) return CATEGORIES;
    const q = search.toLowerCase();
    return CATEGORIES
      .filter(c => !selectedCategory || c.id === selectedCategory)
      .map(c => ({
        ...c,
        formulas: c.formulas.filter(f =>
          !q || f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) ||
          f.tags.some(t => t.includes(q)) || f.latex.toLowerCase().includes(q)
        )
      }))
      .filter(c => c.formulas.length > 0);
  }, [search, selectedCategory]);

  const totalFormulas = CATEGORIES.reduce((sum, c) => sum + c.formulas.length, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Nexus Mathematics Explorer
          </h2>
          <p className="text-xs text-muted-foreground">{totalFormulas} Formeln · 10 Kategorien · v1.0.0</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Formeln, Variablen, Tags durchsuchen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className="cursor-pointer text-xs"
          onClick={() => setSelectedCategory(null)}
        >
          Alle
        </Badge>
        {CATEGORIES.map(c => (
          <Badge
            key={c.id}
            variant={selectedCategory === c.id ? "default" : "outline"}
            className="cursor-pointer text-xs gap-1"
            onClick={() => setSelectedCategory(selectedCategory === c.id ? null : c.id)}
          >
            {ICON_MAP[c.icon] || null}
            {c.name}
          </Badge>
        ))}
      </div>

      {/* Formula grid */}
      <ScrollArea className="h-[500px] pr-2">
        <div className="space-y-4">
          {filteredCategories.map(cat => (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-primary">{ICON_MAP[cat.icon]}</span>
                <h3 className="font-semibold text-sm">{cat.name}</h3>
                <Badge variant="secondary" className="text-[10px]">{cat.formulas.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {cat.formulas.map(formula => (
                  <Card
                    key={formula.id}
                    className={`p-3 cursor-pointer transition-all hover-lift border ${
                      selectedFormula?.id === formula.id
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/30 hover:border-primary/30"
                    }`}
                    onClick={() => setSelectedFormula(selectedFormula?.id === formula.id ? null : formula)}
                  >
                    <p className="font-medium text-sm mb-1">{formula.name}</p>
                    <p className="text-xs font-mono text-primary/80 bg-muted/50 rounded px-2 py-1 mb-2 break-all">
                      {formula.latex}
                    </p>
                    {selectedFormula?.id === formula.id && (
                      <div className="space-y-2 mt-2 animate-in fade-in slide-in-from-top-2">
                        <p className="text-xs text-muted-foreground">{formula.description}</p>
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Variablen:</p>
                          {Object.entries(formula.variables).map(([k, v]) => (
                            <div key={k} className="flex gap-2 text-xs">
                              <span className="font-mono text-accent font-medium min-w-[60px]">{k}</span>
                              <span className="text-muted-foreground">{v}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formula.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              Keine Formeln gefunden für "{search}"
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
