USE dsa_tracker;

INSERT INTO questions (title, link, topic, difficulty) VALUES 
-- Arrays
('Set Matrix Zeroes', 'https://leetcode.com/problems/set-matrix-zeroes/', 'Arrays', 'Medium'),
('Pascal''s Triangle', 'https://leetcode.com/problems/pascals-triangle/', 'Arrays', 'Easy'),
('Next Permutation', 'https://leetcode.com/problems/next-permutation/', 'Arrays', 'Medium'),
('Kadane''s Algorithm', 'https://leetcode.com/problems/maximum-subarray/', 'Arrays', 'Medium'),
('Sort Colors (0s, 1s and 2s)', 'https://leetcode.com/problems/sort-colors/', 'Arrays', 'Medium'),
('Best Time to Buy and Sell Stock', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', 'Arrays', 'Easy'),
('Rotate Image', 'https://leetcode.com/problems/rotate-image/', 'Arrays', 'Medium'),
('Merge Intervals', 'https://leetcode.com/problems/merge-intervals/', 'Arrays', 'Medium'),
('Merge Sorted Array', 'https://leetcode.com/problems/merge-sorted-array/', 'Arrays', 'Easy'),
('Find Duplicate in Array', 'https://leetcode.com/problems/find-the-duplicate-number/', 'Arrays', 'Medium'),

-- Linked Lists
('Reverse Linked List', 'https://leetcode.com/problems/reverse-linked-list/', 'Linked List', 'Easy'),
('Middle of the Linked List', 'https://leetcode.com/problems/middle-of-the-linked-list/', 'Linked List', 'Easy'),
('Merge Two Sorted Lists', 'https://leetcode.com/problems/merge-two-sorted-lists/', 'Linked List', 'Easy'),
('Remove Nth Node From End', 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', 'Linked List', 'Medium'),
('Add Two Numbers', 'https://leetcode.com/problems/add-two-numbers/', 'Linked List', 'Medium'),
('Delete Node in a Linked List', 'https://leetcode.com/problems/delete-node-in-a-linked-list/', 'Linked List', 'Easy'),

-- Two Pointers / Greedy
('3Sum', 'https://leetcode.com/problems/3sum/', 'Two Pointers', 'Medium'),
('Trapping Rain Water', 'https://leetcode.com/problems/trapping-rain-water/', 'Arrays', 'Hard'),
('Remove Duplicates from Sorted Array', 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', 'Two Pointers', 'Easy'),
('Max Consecutive Ones', 'https://leetcode.com/problems/max-consecutive-ones/', 'Arrays', 'Easy');


INSERT INTO users (username, password) VALUES ('developer', 'admin123');