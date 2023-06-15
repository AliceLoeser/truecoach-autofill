const NO_RESULTS_ADDED = "No results added";

function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

function addButtonToHeader(header) {
  if (document.querySelectorAll(".truecoach-autofill").length === 0 && header) {
    header.classList.add(...["truecoach-autofill"]);

    const section = document.createElement("li");
    section.classList.add(...["tc-list-item"]);
    const button = document.createElement("button");
    button.textContent = "Import history";
    button.id = "btn-autofill";
    button.classList.add(...["btn", "btn--white", "btn--s"]);
    section?.append(button);
    header.prepend(section);

    return button;
  }

  return null;
}

async function fillResultFromSearchResults(
  workoutVolumeTitle,
  textareaForResults,
  exerciseTitle
) {
  await waitForElm(`.card.searchResults-workout`);
  const searchResultsAll = document.querySelectorAll(
    ".card.searchResults-workout"
  );

  for (const searchResults of searchResultsAll) {
    const searchResultsFiltered = document.evaluate(
      `.//h4[contains(., '${workoutVolumeTitle}')]`,
      searchResults,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue?.parentNode;

    if (searchResultsFiltered == null) {
      continue;
    }

    const spanMatchingSearchQuery = document.evaluate(
      `.//span[text()='${exerciseTitle}']`,
      searchResultsFiltered,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;

    if (spanMatchingSearchQuery == null) {
      continue;
    }

    const resultsText = spanMatchingSearchQuery.parentNode
      .querySelector("p.exercise-info")
      .textContent.trim();

    if (resultsText !== NO_RESULTS_ADDED) {
      textareaForResults.value = resultsText;
      textareaForResults.style.height = "200px";
      return true;
    }
  }

  return false;
}

async function fillExerciseResults(exerciseSection, workoutVolumeTitle) {
  const exercises = exerciseSection.querySelectorAll("ul li");
  for (const exercise of exercises) {
    const exerciseTitle = exercise.querySelector("h4").textContent;

    const textareaForResults = exercise.querySelector("textarea");
    const viewHistoryButton = exercise.querySelector(
      "button.btn--link:last-child"
    );

    viewHistoryButton.click();
    const closeModalButton = document.querySelector(
      ".ember-modal-dialog .closeButton"
    );

    await fillResultFromSearchResults(
      workoutVolumeTitle,
      textareaForResults,
      exerciseTitle
    );

    closeModalButton.click();
  }
}

const workoutVolumeTitle = () => {
  return document.querySelector("h3").textContent.split(":")[1].trim();
};

const fillSearchResults = () => {
  const header = document.querySelector(
    "div.prnt-header div.split div.split--cell ul"
  );

  autofillButton = addButtonToHeader(header);
  if (autofillButton != null) {
    autofillButton.addEventListener("click", async () => {
      const exerciseSections = document.querySelectorAll(
        "ol.tc-list > li.tc-list-item"
      );

      for (const exerciseSection of exerciseSections) {
        await fillExerciseResults(exerciseSection, workoutVolumeTitle());
      }
    });
  }
  setTimeout(() => fillSearchResults(), 1000);
};

document.addEventListener("DOMContentLoaded", (event) => {
  fillSearchResults();
});
