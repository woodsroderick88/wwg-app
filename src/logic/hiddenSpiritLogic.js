const HIDDEN_SPIRIT_TABLE = {
  1: {
    note:
      "Pure Qian palace placeholder. Hidden-spirit rules are minimal because all palace qi is open at the pure palace level.",
    hiddenLines: [],
  },
  2: {
    note:
      "Pure Kun palace placeholder. Hidden-spirit rules are minimal because all palace qi is open at the pure palace level.",
    hiddenLines: [],
  },
  29: {
    note:
      "Pure Kan palace placeholder. Hidden-spirit rules are minimal because all palace qi is open at the pure palace level.",
    hiddenLines: [],
  },
  30: {
    note:
      "Pure Li palace placeholder. Hidden-spirit rules are minimal because all palace qi is open at the pure palace level.",
    hiddenLines: [],
  },
  51: {
    note:
      "Pure Zhen palace placeholder. Hidden-spirit rules are minimal because all palace qi is open at the pure palace level.",
    hiddenLines: [],
  },
  52: {
    note:
      "Pure Gen palace placeholder. Hidden-spirit rules are minimal because all palace qi is open at the pure palace level.",
    hiddenLines: [],
  },
  57: {
    note:
      "Pure Xun palace placeholder. Hidden-spirit rules are minimal because all palace qi is open at the pure palace level.",
    hiddenLines: [],
  },
  58: {
    note:
      "Pure Dui palace placeholder. Hidden-spirit rules are minimal because all palace qi is open at the pure palace level.",
    hiddenLines: [],
  },

  62: {
    note:
      "Foundation hidden-spirit entry for Xiao Guo. Useful when Parent-line is missing in housing, document, shelter, application, or support questions.",
    hiddenLines: [
      {
        lineNumber: 2,
        hiddenSixKin: "Parent-line",
        hiddenBranch: "Si 巳",
        hiddenElement: "Fire",
        coverRole: "Sibling-line",
        confidence: "Foundation",
        reason:
          "Parent-line is not visible in the six main lines. Line 2 is moving and can be treated as a candidate activation or cover position in this foundation layer.",
      },
      {
        lineNumber: 5,
        hiddenSixKin: "Parent-line",
        hiddenBranch: "Wu 午",
        hiddenElement: "Fire",
        coverRole: "Offspring-line",
        confidence: "Foundation",
        reason:
          "Parent-line is not visible in the six main lines. Line 5 is moving and may participate in revealing or activating the hidden support or document matter.",
      },
    ],
  },
};

function getHiddenSpiritEntry(hexagramNumber) {
  return HIDDEN_SPIRIT_TABLE[Number(hexagramNumber)] || null;
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeFocus(value) {
  return normalizeText(value).toLowerCase();
}

function getOriginalHexagramNumberFromPalaceRules(palaceRules) {
  const entry = palaceRules?.originalShiYing;

  if (entry?.hexagramNumber) {
    return Number(entry.hexagramNumber);
  }

  if (palaceRules?.originalHexagramNumber) {
    return Number(palaceRules.originalHexagramNumber);
  }

  return null;
}

function getFocusLineNumbers(focusRows) {
  if (!Array.isArray(focusRows) || focusRows.length === 0) {
    return [];
  }

  return focusRows
    .map((row) => row.lineNumber)
    .filter((lineNumber) => Number.isInteger(lineNumber));
}

function getMovingLineNumbers(movingLines) {
  if (!Array.isArray(movingLines)) {
    return [];
  }

  return movingLines
    .map((lineNumber) => Number(lineNumber))
    .filter((lineNumber) => Number.isInteger(lineNumber));
}

function getRowByLineNumber(sixKinRows, lineNumber) {
  if (!Array.isArray(sixKinRows)) {
    return null;
  }

  return sixKinRows.find((row) => row.lineNumber === lineNumber) || null;
}

function formatRow(row) {
  if (!row) {
    return "No visible cover line data available.";
  }

  const branchLabel = row.branch?.label || "Unknown branch";
  const sixKin = row.sixKin || "Unknown six-kin";
  const condition = row.condition?.summary || "Unknown condition";
  const moving = row.moving ? "moving" : "static";

  return `Line ${row.lineNumber}: ${branchLabel} / ${sixKin} / ${condition} / ${moving}`;
}

function getLikelyHiddenCandidates({
  selectedFocus,
  hiddenSpiritEntry,
  sixKinRows,
  movingLines,
}) {
  const focus = normalizeFocus(selectedFocus);
  const movingLineNumbers = getMovingLineNumbers(movingLines);

  if (!hiddenSpiritEntry?.hiddenLines?.length) {
    return [];
  }

  return hiddenSpiritEntry.hiddenLines
    .filter((candidate) => normalizeFocus(candidate.hiddenSixKin) === focus)
    .map((candidate) => {
      const coverRow = getRowByLineNumber(sixKinRows, candidate.lineNumber);
      const activatedByMovement = movingLineNumbers.includes(
        candidate.lineNumber
      );

      return {
        ...candidate,
        coverRow,
        coverLineText: formatRow(coverRow),
        activatedByMovement,
      };
    });
}

function getCoverCandidates({ sixKinRows, movingLines, shiLine, yingLine }) {
  const movingLineNumbers = getMovingLineNumbers(movingLines);

  if (!Array.isArray(sixKinRows) || sixKinRows.length === 0) {
    return [];
  }

  return sixKinRows
    .filter((row) => {
      const isMoving = movingLineNumbers.includes(row.lineNumber);
      const touchesShi = row.lineNumber === shiLine;
      const touchesYing = row.lineNumber === yingLine;

      return isMoving || touchesShi || touchesYing;
    })
    .map((row) => ({
      lineNumber: row.lineNumber,
      sixKin: row.sixKin,
      branch: row.branch?.label || "Unknown branch",
      condition: row.condition?.summary || "Unknown condition",
      moving: movingLineNumbers.includes(row.lineNumber),
      touchesShi: row.lineNumber === shiLine,
      touchesYing: row.lineNumber === yingLine,
      text: formatRow(row),
    }));
}

function buildVisibleUsefulSpiritNotes({
  selectedFocus,
  focusRows,
  movingLines,
  palaceRules,
}) {
  const focusLineNumbers = getFocusLineNumbers(focusRows);
  const movingLineNumbers = getMovingLineNumbers(movingLines);
  const shiLine = palaceRules?.shiLine;
  const yingLine = palaceRules?.yingLine;

  const focusOnShi = focusLineNumbers.includes(shiLine);
  const focusOnYing = focusLineNumbers.includes(yingLine);
  const focusMoving = focusLineNumbers.some((lineNumber) =>
    movingLineNumbers.includes(lineNumber)
  );

  const notes = [
    {
      title: "Visible useful spirit check",
      text: `${selectedFocus} is visible on line ${focusLineNumbers.join(
        ", "
      )}. Hidden-spirit search is not required at this MVP layer.`,
    },
  ];

  if (focusOnShi && focusOnYing) {
    notes.push({
      title: "Shi / Ying relationship",
      text:
        "The useful spirit touches both Shi and Ying. This shows the matter connects strongly to both the self side and the object or other side.",
    });
  } else if (focusOnShi) {
    notes.push({
      title: "Shi / Self relationship",
      text:
        "The useful spirit sits on Shi. This ties the matter directly to the querent, the self side, or the party asking the question.",
    });
  } else if (focusOnYing) {
    notes.push({
      title: "Ying / Other relationship",
      text:
        "The useful spirit sits on Ying. This ties the matter directly to the object side, other party, outside condition, or opposing side.",
    });
  } else {
    notes.push({
      title: "Shi / Ying relationship",
      text:
        "The useful spirit is visible, but it does not sit directly on Shi or Ying. Later rule layers should compare how it relates to both sides.",
    });
  }

  if (focusMoving) {
    notes.push({
      title: "Moving-line activation",
      text:
        "The visible useful spirit is on a moving line. This gives the matter activity, change, pressure, or development potential.",
    });
  } else if (movingLineNumbers.length > 0) {
    notes.push({
      title: "Moving-line activation",
      text: `Moving lines are present on line ${movingLineNumbers.join(
        ", "
      )}, but the visible useful spirit itself is not moving.`,
    });
  } else {
    notes.push({
      title: "Moving-line activation",
      text:
        "No moving lines are present. The useful spirit is visible but static at this MVP layer.",
    });
  }

  notes.push({
    title: "Flying spirit status",
    text:
      "Because the useful spirit is visible, no flying-spirit cover is needed at this layer. Future rules can still compare the useful spirit against day/month, Shi/Ying, transformation, void, clash, and combination.",
  });

  notes.push({
    title: "Next required data",
    text:
      "A complete traditional hidden-spirit table is still needed for all 64 hexagrams. This foundation can identify visible useful spirits and use structured entries where available.",
  });

  return notes;
}

function buildHiddenUsefulSpiritNotes({
  selectedFocus,
  hiddenSpiritEntry,
  hiddenCandidates,
  coverCandidates,
  movingLines,
  palaceRules,
}) {
  const movingLineNumbers = getMovingLineNumbers(movingLines);
  const shiLine = palaceRules?.shiLine;
  const yingLine = palaceRules?.yingLine;

  const notes = [
    {
      title: "Visible useful spirit check",
      text: `${selectedFocus} is not visible in the six main lines. Hidden-spirit search is needed before making a firm traditional judgment.`,
    },
  ];

  if (!hiddenSpiritEntry) {
    notes.push({
      title: "Hidden-spirit table lookup",
      text:
        "No structured hidden-spirit table entry exists yet for this hexagram. The app can only flag that the useful spirit is missing and that a hidden-spirit table is required.",
    });

    notes.push({
      title: "Flying-spirit candidates",
      text:
        coverCandidates.length > 0
          ? `Possible cover candidates from active Shi/Ying/moving lines: ${coverCandidates
              .map((candidate) => `Line ${candidate.lineNumber}`)
              .join(", ")}.`
          : "No strong cover candidate was identified from moving lines, Shi, or Ying at this foundation layer.",
    });

    notes.push({
      title: "Next required data",
      text:
        "To make this exact, add a complete hidden-spirit table for the original hexagram's palace structure, including concealed branch, concealed six-kin, and flying-spirit cover line.",
    });

    return notes;
  }

  notes.push({
    title: "Hidden-spirit table lookup",
    text: hiddenSpiritEntry.note,
  });

  if (hiddenCandidates.length === 0) {
    notes.push({
      title: "Hidden useful-spirit candidate",
      text: `A hidden-spirit table entry exists, but no candidate matching ${selectedFocus} was found in this foundation table.`,
    });
  } else {
    hiddenCandidates.forEach((candidate, index) => {
      const shiYingText =
        candidate.lineNumber === shiLine
          ? " This hidden candidate sits under Shi/Self."
          : candidate.lineNumber === yingLine
          ? " This hidden candidate sits under Ying/Other."
          : " This hidden candidate does not sit directly under Shi or Ying.";

      const movementText = candidate.activatedByMovement
        ? " It is on a moving line, so movement may activate or reveal the hidden useful spirit."
        : " It is not on a moving line, so it may remain concealed unless activated by later timing rules.";

      notes.push({
        title:
          hiddenCandidates.length === 1
            ? "Hidden useful-spirit candidate"
            : `Hidden useful-spirit candidate ${index + 1}`,
        text: `Possible hidden ${candidate.hiddenSixKin} under line ${
          candidate.lineNumber
        }: ${candidate.hiddenBranch || "Unknown branch"} / ${
          candidate.hiddenElement || "Unknown element"
        }. Cover line: ${candidate.coverLineText}. ${
          candidate.reason || ""
        }${shiYingText}${movementText}`,
      });
    });
  }

  if (coverCandidates.length > 0) {
    notes.push({
      title: "Flying-spirit cover candidates",
      text: `Candidate cover lines from movement, Shi, or Ying: ${coverCandidates
        .map((candidate) => {
          const tags = [
            candidate.moving ? "moving" : "",
            candidate.touchesShi ? "Shi" : "",
            candidate.touchesYing ? "Ying" : "",
          ]
            .filter(Boolean)
            .join(", ");

          return `Line ${candidate.lineNumber}${
            tags ? ` (${tags})` : ""
          }: ${candidate.branch} / ${candidate.sixKin}`;
        })
        .join("; ")}.`,
    });
  } else {
    notes.push({
      title: "Flying-spirit cover candidates",
      text:
        "No strong flying-spirit cover candidate was identified from moving lines, Shi, or Ying in this foundation layer.",
    });
  }

  if (movingLineNumbers.length > 0) {
    notes.push({
      title: "Moving-line reveal check",
      text: `Moving lines exist on line ${movingLineNumbers.join(
        ", "
      )}. Future hidden-spirit rules should test whether movement reveals, activates, clashes, combines with, or transforms the concealed useful spirit.`,
    });
  } else {
    notes.push({
      title: "Moving-line reveal check",
      text:
        "No moving lines are present. If the useful spirit is hidden, it may remain concealed until day/month timing, void-filling, clash, combination, or later activation rules are applied.",
    });
  }

  notes.push({
    title: "Next required data",
    text:
      "This is a foundation layer. The next upgrade should add a complete 64-hexagram hidden-spirit table with palace-relative hidden branches, flying-spirit covers, and activation rules.",
  });

  return notes;
}

function buildSummary({
  selectedFocus,
  focusRows,
  hiddenCandidates,
  coverCandidates,
  movingLines,
}) {
  const focusLineNumbers = getFocusLineNumbers(focusRows);
  const movingLineNumbers = getMovingLineNumbers(movingLines);

  if (focusLineNumbers.length > 0) {
    return `${selectedFocus} is visible on line ${focusLineNumbers.join(
      ", "
    )}. Hidden-spirit search is not required at this layer. ${
      movingLineNumbers.length > 0
        ? `Moving lines: ${movingLineNumbers.join(", ")}.`
        : "No moving lines."
    }`;
  }

  if (hiddenCandidates.length > 0) {
    return `${selectedFocus} is not visible. Hidden-spirit foundation found ${
      hiddenCandidates.length
    } possible hidden candidate${
      hiddenCandidates.length === 1 ? "" : "s"
    }: ${hiddenCandidates
      .map(
        (candidate) =>
          `Line ${candidate.lineNumber} (${candidate.hiddenBranch || "unknown"})`
      )
      .join(", ")}. ${
      coverCandidates.length > 0
        ? `Possible flying-spirit cover lines: ${coverCandidates
            .map((candidate) => candidate.lineNumber)
            .join(", ")}.`
        : "No strong cover candidate found."
    }`;
  }

  return `${selectedFocus} is not visible. Hidden-spirit search is needed, but no exact hidden-spirit table candidate is available yet. ${
    coverCandidates.length > 0
      ? `Possible cover lines from active Shi/Ying/moving lines: ${coverCandidates
          .map((candidate) => candidate.lineNumber)
          .join(", ")}.`
      : "A full hidden-spirit table is required for a firm judgment."
  }`;
}

export function buildHiddenSpiritPreview({
  selectedFocus,
  focusRows = [],
  sixKinRows = [],
  palaceRules = {},
  movingLines = [],
}) {
  const focusLineNumbers = getFocusLineNumbers(focusRows);
  const visibleFocusFound = focusLineNumbers.length > 0;
  const originalHexagramNumber = getOriginalHexagramNumberFromPalaceRules(
    palaceRules
  );

  const hiddenSpiritEntry = getHiddenSpiritEntry(originalHexagramNumber);

  const hiddenCandidates = visibleFocusFound
    ? []
    : getLikelyHiddenCandidates({
        selectedFocus,
        hiddenSpiritEntry,
        sixKinRows,
        movingLines,
      });

  const coverCandidates = visibleFocusFound
    ? []
    : getCoverCandidates({
        sixKinRows,
        movingLines,
        shiLine: palaceRules?.shiLine,
        yingLine: palaceRules?.yingLine,
      });

  const notes = visibleFocusFound
    ? buildVisibleUsefulSpiritNotes({
        selectedFocus,
        focusRows,
        movingLines,
        palaceRules,
      })
    : buildHiddenUsefulSpiritNotes({
        selectedFocus,
        hiddenSpiritEntry,
        hiddenCandidates,
        coverCandidates,
        movingLines,
        palaceRules,
      });

  const hiddenSpiritStatus = visibleFocusFound
    ? "Visible useful spirit found"
    : hiddenCandidates.length > 0
    ? "Hidden useful spirit candidate found"
    : "Visible useful spirit missing";

  const flyingSpiritStatus = visibleFocusFound
    ? "No flying-spirit cover needed at this MVP layer"
    : coverCandidates.length > 0
    ? "Possible flying-spirit cover candidates found"
    : "Flying-spirit cover requires full hidden table";

  const summary = buildSummary({
    selectedFocus,
    focusRows,
    hiddenCandidates,
    coverCandidates,
    movingLines,
  });

  return {
    selectedFocus,
    visibleFocusFound,
    hiddenSpiritStatus,
    flyingSpiritStatus,

    originalHexagramNumber,
    hiddenSpiritEntry,
    hiddenCandidates,
    coverCandidates,

    notes,
    summary,
  };
}