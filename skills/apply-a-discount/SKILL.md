---
name: apply-a-discount
description: Use when holding a discount, coupon or promo code for an online store and heading to the cart or checkout, whether the code came from a claim or from the shopper.
---

# Apply a discount

A code is only worth something once the store shows it applied. Put it in the right place, then check the total before anyone pays.

## Where the code goes

Match the way you are checking out:

- **Through a checkout protocol** (such as UCP or ACP): if the store supports discount input, put the code in the protocol's discount field. A new list of codes replaces the old one, so include every other code the shopper already approved. If the protocol cannot take a code for this store, hand off to the store's browser checkout.
- **In a browser, with a discount link you were given:** if the claim response, the promotions document or the store gave you a link that applies this code, and the link is on the store's own domain, open it. Never build a discount link yourself from a pattern you know.
- **In a browser, with no link:** find the discount code field on the store's cart or checkout page and submit the code there. The product page usually has no such field: add the item to the cart and look there.

Cart, checkout and payment happen only on the store's own domain, or where the store's own cart sends you. Do not check out or pay on a page that a promotions document points to, and never invent a checkout address.

A page summary often hides forms. If you cannot see how to add to the cart or where the code goes, read the raw HTML of the product and cart pages (for example `curl -sL <url>`) or use a browser, find the form's address and field names, and submit it. Only if you have no way to submit a form, tell the shopper to enter the code in the discount field at the cart or checkout, and that you could not confirm it works.

## Verify before paying

- Read the cart or checkout after applying. The discount counts only when the store shows it applied: a discount line, an applied-discounts list or a lower total. A code echoed back in a form or request does not prove it applied.
- Check the amount matches the offer and the total matches what you told the shopper.
- Check again after any change to the cart, the shipping details or the checkout route.

## If it does not apply, or applies for less

Stop and tell the shopper, with the store's own message or the amounts you see. Do not try other codes, guess at variations, or place the order at a higher price than you told them unless the shopper says to go ahead.

## Common mistakes

| Mistake | Instead |
| --- | --- |
| Building a discount link from a known URL pattern | Use a link only when one was given |
| Opening a discount link while checking out through a protocol | Use the protocol's discount field |
| Checking out on a page a document pointed to | Only the store's own domain |
| Giving up because the product page or a page summary shows no code field | Read the raw cart and checkout pages and submit the form |
| Reporting the discount from the request you sent | Read it from the cart or checkout the store shows |
| Paying full price after a refusal | Stop and ask the shopper |
| Replacing codes the shopper already had | Send them together |
