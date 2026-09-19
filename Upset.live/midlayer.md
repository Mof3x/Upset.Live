Test a React template with sample content first, using dummy text, placeholder images, and edge-case content, then later swap that test data for real Directus content.

## How templates are tested

The normal workflow is wireframe first, then component/template, then prototype, then testing on real screens and with real-ish content. Your planning notes explicitly treat wireframes, prototypes, build, and testing as separate stages, and they also stress testing on phones, slow internet, forms, and navigation before launch.

So in practice you do not wait for all real CMS content before building. You mock up what an artist page, work page, journal page, or homepage rail should look like, and you feed it temporary content to see whether the layout holds together.

## What you test with

Yes, you use dummy media and text, but not only pretty dummy content. The smart way is to test with several kinds of content so your template does not only work in the “perfect demo” case.

Good test content usually includes:

- Short title, long title, and absurdly long title.
    
- Short paragraph, long paragraph, and missing paragraph.
    
- Landscape image, portrait image, and no image.
    
- One related item, many related items, and zero related items.
- 
- Clean metadata and messy metadata, for example no year, no category, no bio.

That is how you find out whether cards break, headings wrap badly, rails become ugly, or the page feels empty when content is sparse.

## Three useful stages

A practical way to build it is:

1. Static mock data in React, where you hardcode a sample object in a file and get the layout right.
    
2. Seed content in Directus, where you create a few fake-but-real entries in the CMS and confirm the API shape works.
    
3. Real editorial content, where the design gets stress-tested by actual writing, real images, and inconsistent human behaviour.
    

That middle step matters a lot, because Directus is meant for structured content entry, so once your collections exist you can create a few realistic records and test the actual fetch-render cycle before launch.

## What this looks like in code

At the start, a page might use local mock data like this:

jsx

`const mockWork = {   title: "A Very Long Artwork Title That Might Wrap Onto Multiple Lines",  year: "2026",  description:    "This is placeholder copy used to test how the card and detail template behaves when the editor writes more than expected.",  image:    "https://picsum.photos/1200/800",  artists: [{ name: "Artist Name", slug: "artist-name" }], };`

Then your template renders that object into semantic markup. Later, you replace `mockWork` with data from Directus, but the component structure stays mostly the same because React is still just rendering fields into HTML.

## What you are really checking

When testing a template, you are asking:

- Does the hierarchy still make sense with real-length content?
- Does the page still look good with too much or too little media?
    
- Do related links and cross-linking rails still work when editors add more items?
    
- Does the layout survive mobile, tablet, and desktop?
- Does missing content fail gracefully instead of breaking the page?
    

That is why testing is not just “does it look nice.” It is really “does this template survive the messiness of actual content entry.”
## Best habit

The best habit is to build each template with:

- Ideal sample content.
    
- Worst-case sample content.
    
- Empty-state sample content.
    

If a template works in all three, it is usually safe to hand over to editors. After that, Directus becomes the place where content is swapped in and updated, while React keeps the page structure consistent.

A very useful next step is to create one fake `works` item, one fake `artist`, and one fake `journal` entry in Directus, then connect your React templates to those records and test the full flow end to end.

Would you like me to show you a proper `mockData.js` file and a `WorkPage.jsx` template the way you would actually build and test it first?