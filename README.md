# Mustang Trails website

The website for Mustang Trails, an ATV and UTV park in Quinlan, Texas.

- **Hosting:** Cloudflare Pages (free, and it allows business sites).
- **Control panel:** Pages CMS at https://app.pagescms.org. The owner signs in with GitHub. Editors are invited by email and don't need a GitHub account.
- **Code:** everything lives in this GitHub repository. Every save in the control panel is a commit here. Cloudflare rebuilds the live site about a minute after each commit.

## Everyday editing (no code)

1. Go to https://app.pagescms.org and sign in, with GitHub or with the email address you were invited with.
2. Open this repository. The menu on the left lists the editable parts of the page:
   - Trail status
   - Business details
   - Top of page
   - Photo gallery
   - Pricing
   - Ride day
   - Hours and map
   - Contact
3. Make your change and press **Save**. The live site updates about a minute later.

Formatting tips:

- Put text in `[square brackets]` to show it as a yellow "fill this in" note on the site. Remove the brackets once the real info is in.
- Wrap words in `**double stars**` to make them **bold**.
- In longer text boxes, leave an empty line between paragraphs.

Common jobs:

- **Close the trails after rain:** go to Trail status banner, turn on "Show the status banner", set it to "Trails closed", write a short message, and set today's date. Turn the banner off again when it's no longer needed.
- **Add photos:** go to Photo gallery and click "Add an entry" under Photos. Upload the photo and give it a caption. Phone photos are fine because they are resized automatically.
- **Turn on online payments:** in Stripe, create a Payment Link for a pass. In the control panel, open Pricing, paste the link into that pass's "Stripe Payment Link" field, and turn off "Coming soon". The pass then shows a Buy button.

## Contact form

Messages from the contact form and the email sign-up go to the address in Business details, through FormSubmit (formsubmit.co). FormSubmit is free and needs no account.

The very first message sends a one-time "Activate" email to that inbox. Click it once, and every later message arrives normally. If you change the email address, the new address has to be activated the same way.

## One-time setup

### 1. Put the code on GitHub

Create a repository, for example `mustang-trails-site`, and upload these files to it.

### 2. Connect Cloudflare Pages

1. Create a free account at https://dash.cloudflare.com.
2. Go to **Workers & Pages**, choose **Create**, then **Pages**, then **Connect to Git**, and pick the repository.
3. Use these build settings:
   - Framework preset: None
   - Build command: `npm run build`
   - Build output directory: `_site`
4. Click **Save and Deploy**. The site goes live at `https://<project-name>.pages.dev`.
5. Optional: to use your own domain, go to **Custom domains**. Then enter the full address in Business details, under "Website address", so link previews use it.

### 3. Connect the control panel

1. Go to https://app.pagescms.org and sign in with GitHub.
2. When asked, install the Pages CMS GitHub app on this repository.
3. Pages CMS reads `.pages.yml` from this repository and builds the menu from it.

## Handing the site over

The person who edits the site does **not** need a GitHub account. One person (the owner) keeps the GitHub and Cloudflare accounts. Editors get access to the control panel by email.

**Add an editor (owner does this once):**

1. Sign in to https://app.pagescms.org with the owner's GitHub account and open this repository.
2. Open the collaborators settings and invite the editor's email address.
3. The editor gets an email invite and signs in with that email address. They can change all the content and photos. They cannot change the control panel setup or invite other people.

**Optional extras:**

- **Cloudflare:** invite the editor under Manage Account > Members, so they can see the site's settings and the build history. Cloudflare also works with just an email address.
- **Full transfer later:** if the editor ever wants to own everything, they can create a free GitHub account at https://github.com/signup. Then transfer the repository to them (Settings > Transfer ownership) and reconnect Cloudflare Pages to it.
- **Domain:** if there is one, keep it in the owner's account, or add the editor to that account.

## For developers

- Page layout: `src/index.njk`. Styles: `src/_includes/styles.css`. Scripts: `src/_includes/site.js`.
- Content: `src/_data/*.json`, which the control panel edits. Photos: `src/media/`.
- Photo resizing: `src/_data/images.js`, using `@11ty/eleventy-img`.
- Built with Eleventy 3.

To run it locally:

```sh
npm install
npm start      # local preview at http://localhost:8080
npm run build  # writes the finished site to _site/
```

If you add a new kind of content, add a field to the JSON file and to `.pages.yml`, then use it in `src/index.njk`.
