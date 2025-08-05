# Βάση εικόνας Nginx για static files
FROM nginx:1.21-alpine

# Διαγραφή προεπιλεγμένων ρυθμίσεων Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Αντιγραφή static assets
COPY build/ /usr/share/nginx/html
# Αντιγραφή προσαρμοσμένων ρυθμίσεων Nginx (προαιρετικό)
# COPY nginx.conf /etc/nginx/conf.d

# Θύρα που ακούει ο Nginx
EXPOSE 80

# Nginx διατηρείται ενεργό στο foreground
CMD ["nginx", "-g", "daemon off;"]