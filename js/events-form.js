import {
    uploadImage,
    savePost,
    loadPosts
} from "./posts.js";

import { loadEvents } from "./events-post.js";

export function initEventsForm() {

    const form =
        document.getElementById("eventForm");

    if (!form) return;

    const imageInput =
        document.getElementById("image");

    const fileName =
        document.getElementById("file-name");

    imageInput?.addEventListener("change", () => {

        fileName.textContent =
            imageInput.files.length
                ? imageInput.files[0].name
                : "No file selected";

    });

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const loading =
            document.getElementById("loadingOverlay");

        loading?.classList.remove("hidden");

        try {

            const title =
                document.getElementById("title").value;

            const date =
                document.getElementById("date").value;

            const location =
                document.getElementById("location").value;

            const description =
                document.getElementById("description").value;

            const imageFile =
                document.getElementById("image").files[0];

            let imageUrl = "";

            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            await savePost({
                title,
                date,
                location,
                description,
                imageUrl
            });

            const userPosts =
                document.getElementById("userPosts");

            if (userPosts) {
                await loadPosts(userPosts);
            }

            await loadEvents();

            form.reset();

            fileName.textContent =
                "No file selected";

        }

        catch (err) {

            console.error(err);

            alert("Something went wrong.");

        }

        finally {

            loading?.classList.add("hidden");

        }

    });

}