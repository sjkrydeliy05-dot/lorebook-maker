
export interface TavoEntry {
  uid: number;
  key: string[];
  keysecondary: string[];
  comment: string;
  content: string;
  constant: boolean;
  vectorized: boolean;
  selective: boolean;
  selectiveLogic: number;
  addMemo: boolean;
  order: number;
  position: string;
  disable: boolean;
  excludeRecursion: boolean;
  preventRecursion: boolean;
  delayUntilRecursion: boolean;
  probability: number;
  useProbability: boolean;
  depth: number;
  group: string;
  groupOverride: boolean;
  groupWeight: number;
  scanDepth: null | number;
  caseSensitive: boolean | null;
  matchWholeWords: null | boolean;
  useGroupScoring: null | boolean;
  automationId: string;
  role: null | number;
  sticky: number;
  cooldown: number;
  delay: number;
  displayIndex: number;
  extensions: {
    position: number;
    exclude_recursion: boolean;
    display_index: number;
    probability: number;
    useProbability: boolean;
    depth: number;
    selectiveLogic: number;
    group: string;
    group_override: boolean;
    group_weight: number;
    prevent_recursion: boolean;
    delay_until_recursion: boolean;
    scan_depth: null | number;
    match_whole_words: null | boolean;
    use_group_scoring: null | boolean;
    case_sensitive: null | boolean;
    automation_id: string;
    role: number | null;
    vectorized: boolean;
    sticky: number;
    cooldown: number;
    delay: number;
  };
}

export interface TavoData {
  entries: {
    [key: string]: TavoEntry;
  };
}
