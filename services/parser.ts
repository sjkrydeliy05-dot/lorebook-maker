
import type { TavoData, TavoEntry } from '../types';

const createDefaultEntry = (uid: number, comment: string, content: string, keys: string[], isConstant: boolean = false): TavoEntry => {
    const entry: TavoEntry = {
        uid,
        key: keys,
        keysecondary: [],
        comment,
        content,
        constant: isConstant,
        vectorized: false,
        selective: false,
        selectiveLogic: 0,
        addMemo: true,
        order: uid, // Use UID for order to maintain parsing sequence
        position: 'before_char',
        disable: false,
        excludeRecursion: false,
        preventRecursion: false,
        delayUntilRecursion: false,
        probability: 100,
        useProbability: true,
        depth: 4,
        group: "",
        groupOverride: false,
        groupWeight: 100,
        scanDepth: null,
        caseSensitive: false,
        matchWholeWords: null,
        useGroupScoring: null,
        automationId: "",
        role: null,
        sticky: 0,
        cooldown: 0,
        delay: 0,
        displayIndex: uid,
        extensions: {
            position: 1,
            exclude_recursion: false,
            display_index: uid,
            probability: 100,
            useProbability: true,
            depth: 4,
            selectiveLogic: 0,
            group: "",
            group_override: false,
            group_weight: 100,
            prevent_recursion: false,
            delay_until_recursion: false,
            scan_depth: null,
            match_whole_words: null,
            use_group_scoring: false,
            case_sensitive: null,
            automation_id: "",
            role: 0,
            vectorized: false,
            sticky: 0,
            cooldown: 0,
            delay: 0,
        }
    };
    return entry;
};

export const parseTextToTavoJson = (text: string): TavoData => {
    const entries: { [key: string]: TavoEntry } = {};
    let uidCounter = 0;
    
    const districtBlocks = text.split('---').filter(s => s.trim());

    for (const block of districtBlocks) {
        // Use a regex to split the block into the district part and the location parts
        const locationSplitter = /\n(?=###\s+)/;
        const parts = block.trim().split(locationSplitter);

        const districtInfo = parts[0];
        if (!districtInfo) continue;
        
        const districtLines = districtInfo.trim().split('\n');
        const districtHeaderLine = districtLines.find(l => l.startsWith('## '));
        if (!districtHeaderLine) continue;
        
        // Extract district name, stopping at the first parenthesis or space
        const districtHeaderMatch = districtHeaderLine.match(/^##\s+([^(\s]+)/);
        if (!districtHeaderMatch) continue;
        const districtName = districtHeaderMatch[1].trim();
        
        // Create the main district entry
        const districtContent = districtInfo.trim();
        const mainTavoEntry = createDefaultEntry(uidCounter, districtName, districtContent, [districtName], true);
        entries[mainTavoEntry.uid.toString()] = mainTavoEntry;
        uidCounter++;

        // Process location sub-entries if they exist
        if (parts.length > 1) {
            const locationInfos = parts.slice(1);
            for (const locationInfo of locationInfos) {
                const locationContent = locationInfo.trim();
                const locationLines = locationContent.split('\n');
                const locationHeaderLine = locationLines[0];
                
                const locationHeaderMatch = locationHeaderLine.match(/^###\s+(.+)/);
                if (!locationHeaderMatch) continue;
                const locationName = locationHeaderMatch[1].trim();
                
                const subTavoEntry = createDefaultEntry(uidCounter, locationName, locationContent, [locationName, districtName], false);
                entries[subTavoEntry.uid.toString()] = subTavoEntry;
                uidCounter++;
            }
        }
    }


    if (Object.keys(entries).length === 0) {
        throw new Error("解析失败。请确保格式正确，以 `---` 分割区域，以 `##` 定义区域标题，以 `###` 定义地点。");
    }

    return { entries };
};
