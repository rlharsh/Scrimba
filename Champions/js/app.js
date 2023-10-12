import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL: "https://endorsements-782a6-default-rtdb.firebaseio.com/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const endorsementsInDB = ref(database, "endorsements");

const endorsementsEL = document.querySelector(".endorsements-listing");
const endorsmentFrom = document.querySelector("#user-endorsement-from");
const endorsmentTo = document.querySelector("#user-endorsement-to");
const endorsementBody = document.querySelector("#user-endorsement");
const submitFormButton = document.querySelector("#submit-endorsement");

submitFormButton.addEventListener("click", submitEndorsement);
onValue(endorsementsInDB, loadEndorsements);

function submitEndorsement(event) {
  event.preventDefault();

  if (endorsmentFrom.value && endorsmentTo.value && endorsementBody.value) {
    const userData = {
      to: endorsmentTo.value,
      from: endorsmentFrom.value,
      body: endorsementBody.value,
      likes: 0,
    };

    push(endorsementsInDB, userData);
    clearFormData();
  }
}

function loadEndorsements(snapshot) {
  clearEndorsements();

  if (!snapshot.exists()) {
    console.log("No data could be found!");
    return;
  }

  const endorsementsEntries = Object.entries(snapshot.val()).reverse();
  endorsementsEntries.forEach(createEndorsementCard);
}

function createEndorsementCard(endorsement) {
  const [id, data] = endorsement;
  const { from, to, body, likes } = data;

  const cardHTML = `
    <div class='endorsement-card'>
      <h3 class='strong-text-dark-h3'>To ${to}</h3>
      <p>${body}</p>
      <section class='endorsement-card-footer'>
        <h3 class='strong-text-dark-h3'>From ${from}</h3>
        <h3 data-like-id='${id}' class='strong-text-dark-h3 like-heart'>❤️ ${likes}</h3>
      </section>
    </div>`;

  endorsementsEL.innerHTML += cardHTML;

  const newHeart = endorsementsEL.lastElementChild.querySelector(".like-heart");
  if (isEndorsementLiked(id)) {
    newHeart.classList.add("liked");
  }

  newHeart.addEventListener("click", userLikedEndorsement);
}

async function userLikedEndorsement(event) {
  const heartElement = event.currentTarget;
  const endorsementId = heartElement.getAttribute("data-like-id");

  if (isEndorsementLiked(endorsementId)) {
    console.log("User already liked!");
    return;
  }
  addEndorsementToLiked(endorsementId);

  const likesRef = ref(database, `endorsements/${endorsementId}/likes`);
  try {
    const snapshot = await get(likesRef);
    const currentLikes = snapshot.val() || 0;
    await set(likesRef, currentLikes + 1);
  } catch (error) {
    console.error("Error updating likes:", error);
  }
}

function clearEndorsements() {
  endorsementsEL.innerHTML = "";
}

function isEndorsementLiked(id) {
  const likedPosts = JSON.parse(
    localStorage.getItem("endorsmentsLiked") || "[]"
  );
  return likedPosts.includes(id);
}

function addEndorsementToLiked(id) {
  const likedPosts = JSON.parse(
    localStorage.getItem("endorsmentsLiked") || "[]"
  );
  likedPosts.push(id);
  localStorage.setItem("endorsmentsLiked", JSON.stringify(likedPosts));
}

function clearFormData() {
  endorsmentFrom.value = "";
  endorsmentTo.value = "";
  endorsementBody.value = "";
}
