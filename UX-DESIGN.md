# User Experience Design

## Prototype

The **SwapBay interactive prototype** provides a visual representation of the application's core user flows and layout.  
It illustrates how users will navigate between pages. This prototype serves as the foundation for front-end design decisions.

You can explore the prototype here:  
[View the SwapBay Figma Prototype](https://www.figma.com/proto/MEFf9AH5Hf5Vi8sPdC7UUp/swapbay-wireframe?node-id=5-34&p=f&t=UuftW7pridzlyPbC-1&scaling=scale-down&content-scaling=fixed&page-id=5%3A33&starting-point-node-id=5%3A34)

---

## App Map

### Navigation Flow Diagram
![App Map](ux-design/appmap.png)

---
### Onboarding Phase

![Onboarding Pages](ux-design/user.png)

*Purpose:* Entry point for existing and new users to access their account.
---
### Home Page

![Home Page](ux-design/home.png)

*Purpose:* On the Home page, Users can browser/search/filter postings, make offers, message owners, access their profile settings, inbox and status of their offers. 



---

## My Items Page

![My Items Page](ux-design/myItems.png)

**Purpose:**  
Displays all items owned by the user — whether listed or not — as part of their personal inventory.

**Key Features:**  
- Card layout for each item showing **image**, **name**, and **short description**.  
- **Remove** button allows users to delete an item from their inventory.  
- **Details** button opens a full view of the item’s information.  
- **Add to My Listing** button allows users to publish the selected item on the *My Listings* page.  
- **Add New Item** button at the top enables quick addition of a new item to the inventory.  

---

## My Listings Page

![My Listings Page](ux-design/myListings.png)

**Purpose:**  
Displays all active items that the user has chosen to list for swapping or selling.  

**Key Features:**  
- Card layout showing each active listing with **item image**, **title**, **category**, and **offer count**.  
- **Remove** button lets users take an item down from their public listings (it remains stored in *My Items*).  
- **Details** button opens the full listing page to view or edit details and manage offers.  
- **Add to Listing** button takes users to the *My Items* screen, where they can select additional items to list.  

### Per Listing Details Page

![Per Listing Details Page](ux-design/perListingDetails.png)

**Purpose:**  
Shows complete details about a single listing, including received offers and offer status.

**Key Features:**
- Gray placeholder box for the item image.  
- Text fields displaying the *item description*, *condition*, and *category*.  
- Section for *offers received* 



---

## Add New Item Page

![Add New Item Page](ux-design/addNewItem.png)

**Purpose:**  
Allows users to create and store a new item in their personal inventory (“My Items”) without immediately listing it for swap or sale.  

**Key Features:**  
- Input fields for **Item Name**, **Category**, **Description**, and **Condition**.  
- Placeholder gray box for uploading an **Item Image**.  
- **Save Item** button adds the new item to the *My Items* inventory.  



---




### Offer Composer Screen
![Offer Composer Screen](ux-design/offercomposer.png)

**Purpose:**  
Allows the user to compose an offer for another item.

**Key Features:**
- Displays the target item summary (title, category, and offer count).  
- Options to either **Add Money** or **Swap Item** with respective input fields.  
- Input areas for amount, item name, and item description.  
- “Upload Photo” button for file upload.  
- **Confirm Offer** button to submit.
---

### Profile and Edit Screen
![Profile Screen](ux-design/profile.png) ![Edit Profile Screen](ux-design/editprofile.png)

**Purpose:**  
Displays user account details and available actions.

**Key Features:**
- Placeholder for profile picture.  
- Text areas for **Name**, **Email Address**, and **Phone Number**.  
- Buttons for **Edit Profile**, **Delete Account**, and **Log Out**.  
- Change photo option.  
- Editable fields for name, phone number, and email address.  
- **Done Editing** button confirms changes.  
- **Cancel Edit** button returns to the previous screen.

---

### My Offers Page

![My Offers](ux-design/my%20offers.png)

**Purpose:**  
Allows users to view all the offers they have made to other users' listings.

**Key Features:**
- Organized card layout showing each offer with details such as *item name*, *offer type* (money or swap), and *offer status* (pending, accepted, or rejected).  
- Quick navigation to each item's details to track progress or withdraw offers.  
- Clear indicators for pending and completed transactions to keep users informed.  
- Visual consistency with other listing pages for a seamless experience.

---

### Inbox Page

![Inbox](ux-design/inbox.png)

**Purpose:**  
Provides a central communication hub where users can manage all their chats.

**Key Features:**
- List view showing all chat partners with *profile image*, *name*, and *last message preview*.  
- Navigation options to go **back to Home**, **open Profile**, or **view Chat History**.  
- Notification indicators for unread messages to keep users updated.  
- Intuitive design enabling users to quickly jump between ongoing conversations.

---

### Chat View Page

![Chat View](ux-design/chat%20view.png)

**Purpose:**  
Facilitates one-on-one conversations between users to negotiate or discuss offers.

**Key Features:**
- Clear distinction between **sent** and **received** messages for readability.  
- Option to return to **Inbox** or **Profile** for navigation consistency.  
- Chat bubbles designed to resemble common messaging interfaces for familiarity.  
- Space for inputting and sending new messages at the bottom of the screen.  
- Potential integration of multimedia (e.g., image sharing) in later iterations.

---

