import _ from 'lodash';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export const mapUrl = (url, permissions) => {
    return _.some(permissions, (pattern) => {
    // Convert the pattern to a regular expression for matching
    const regex = new RegExp(`^${pattern.replace(/[*]/g, '.*')}$`);
    return regex.test(url);
    });
}