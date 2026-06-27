"use client";

import { useEffect, useState } from "react";
import { SiOpenai, SiClaude } from "react-icons/si";
import type { IconType } from "react-icons";

const PostgreSQLIcon = () => (
  <svg
    width="40"
    height="40"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 128 128"
  >
    <path d="M93.809 92.112c.785-6.533.55-7.492 5.416-6.433l1.235.108c3.742.17 8.637-.602 11.513-1.938 6.191-2.873 9.861-7.668 3.758-6.409-13.924 2.873-14.881-1.842-14.881-1.842 14.703-21.815 20.849-49.508 15.543-56.287-14.47-18.489-39.517-9.746-39.936-9.52l-.134.025c-2.751-.571-5.83-.912-9.289-.968-6.301-.104-11.082 1.652-14.709 4.402 0 0-44.683-18.409-42.604 23.151.442 8.841 12.672 66.898 27.26 49.362 5.332-6.412 10.484-11.834 10.484-11.834 2.558 1.699 5.622 2.567 8.834 2.255l.249-.212c-.078.796-.044 1.575.099 2.497-3.757 4.199-2.653 4.936-10.166 6.482-7.602 1.566-3.136 4.355-.221 5.084 3.535.884 11.712 2.136 17.238-5.598l-.22.882c1.474 1.18 1.375 8.477 1.583 13.69.209 5.214.558 10.079 1.621 12.948 1.063 2.868 2.317 10.256 12.191 8.14 8.252-1.764 14.561-4.309 15.136-27.985" />
    <path d="M75.458 125.256c-4.367 0-7.211-1.689-8.938-3.32-2.607-2.46-3.641-5.629-4.259-7.522l-.267-.79c-1.244-3.358-1.666-8.193-1.916-14.419-.038-.935-.064-1.898-.093-2.919-.021-.747-.047-1.684-.085-2.664a18.8 18.8 0 01-4.962 1.568c-3.079.526-6.389.356-9.84-.507-2.435-.609-4.965-1.871-6.407-3.82-4.203 3.681-8.212 3.182-10.396 2.453-3.853-1.285-7.301-4.896-10.542-11.037-2.309-4.375-4.542-10.075-6.638-16.943-3.65-11.96-5.969-24.557-6.175-28.693C4.292 23.698 7.777 14.44 15.296 9.129 27.157.751 45.128 5.678 51.68 7.915c4.402-2.653 9.581-3.944 15.433-3.851 3.143.051 6.136.327 8.916.823 2.9-.912 8.628-2.221 15.185-2.139 12.081.144 22.092 4.852 28.949 13.615 4.894 6.252 2.474 19.381.597 26.651-2.642 10.226-7.271 21.102-12.957 30.57 1.544.011 3.781-.174 6.961-.831 6.274-1.295 8.109 2.069 8.607 3.575 1.995 6.042-6.677 10.608-9.382 11.864-3.466 1.609-9.117 2.589-13.745 2.377l-.202-.013-1.216-.107-.12 1.014-.116.991c-.311 11.999-2.025 19.598-5.552 24.619-3.697 5.264-8.835 6.739-13.361 7.709-1.544.33-2.947.474-4.219.474zm-9.19-43.671c2.819 2.256 3.066 6.501 3.287 14.434.028.99.054 1.927.089 2.802.106 2.65.355 8.855 1.327 11.477.137.371.26.747.39 1.146 1.083 3.316 1.626 4.979 6.309 3.978 3.931-.843 5.952-1.599 7.534-3.851 2.299-3.274 3.585-9.86 3.821-19.575l4.783.116-4.75-.57.14-1.186c.455-3.91.783-6.734 3.396-8.602 2.097-1.498 4.486-1.353 6.389-1.01-2.091-1.58-2.669-3.433-2.823-4.193l-.399-1.965 1.121-1.663c6.457-9.58 11.781-21.354 14.609-32.304 2.906-11.251 2.02-17.226 1.134-18.356-11.729-14.987-32.068-8.799-34.192-8.097l-.359.194-1.8.335-.922-.191c-2.542-.528-5.366-.82-8.393-.869-4.756-.08-8.593 1.044-11.739 3.431l-2.183 1.655-2.533-1.043c-5.412-2.213-21.308-6.662-29.696-.721-4.656 3.298-6.777 9.76-6.305 19.207.156 3.119 2.275 14.926 5.771 26.377 4.831 15.825 9.221 21.082 11.054 21.693.32.108 1.15-.537 1.976-1.529a270.708 270.708 0 0110.694-12.07l2.77-2.915 3.349 2.225c1.35.897 2.839 1.406 4.368 1.502l7.987-6.812-1.157 11.808c-.026.265-.039.626.065 1.296l.348 2.238-1.51 1.688-.174.196 4.388 2.025 1.836-2.301z" />
    <path
      fill="#336791"
      d="M115.731 77.44c-13.925 2.873-14.882-1.842-14.882-1.842 14.703-21.816 20.849-49.51 15.545-56.287C101.924.823 76.875 9.566 76.457 9.793l-.135.024c-2.751-.571-5.83-.911-9.291-.967-6.301-.103-11.08 1.652-14.707 4.402 0 0-44.684-18.408-42.606 23.151.442 8.842 12.672 66.899 27.26 49.363 5.332-6.412 10.483-11.834 10.483-11.834 2.559 1.699 5.622 2.567 8.833 2.255l.25-.212c-.078.796-.042 1.575.1 2.497-3.758 4.199-2.654 4.936-10.167 6.482-7.602 1.566-3.136 4.355-.22 5.084 3.534.884 11.712 2.136 17.237-5.598l-.221.882c1.473 1.18 2.507 7.672 2.334 13.557-.174 5.885-.29 9.926.871 13.082 1.16 3.156 2.316 10.256 12.192 8.14 8.252-1.768 12.528-6.351 13.124-13.995.422-5.435 1.377-4.631 1.438-9.49l.767-2.3c.884-7.367.14-9.743 5.225-8.638l1.235.108c3.742.17 8.639-.602 11.514-1.938 6.19-2.871 9.861-7.667 3.758-6.408z"
    />
    <path
      fill="#fff"
      d="M75.957 122.307c-8.232 0-10.84-6.519-11.907-9.185-1.562-3.907-1.899-19.069-1.551-31.503a1.59 1.59 0 011.64-1.55 1.594 1.594 0 011.55 1.639c-.401 14.341.168 27.337 1.324 30.229 1.804 4.509 4.54 8.453 12.275 6.796 7.343-1.575 10.093-4.359 11.318-11.46.94-5.449 2.799-20.951 3.028-24.01a1.593 1.593 0 011.71-1.472 1.597 1.597 0 011.472 1.71c-.239 3.185-2.089 18.657-3.065 24.315-1.446 8.387-5.185 12.191-13.794 14.037-1.463.313-2.792.453-4 .454zM31.321 90.466a6.71 6.71 0 01-2.116-.35c-5.347-1.784-10.44-10.492-15.138-25.885-3.576-11.717-5.842-23.947-6.041-27.922-.589-11.784 2.445-20.121 9.02-24.778 13.007-9.216 34.888-.44 35.813-.062a1.596 1.596 0 01-1.207 2.955c-.211-.086-21.193-8.492-32.768-.285-5.622 3.986-8.203 11.392-7.672 22.011.167 3.349 2.284 15.285 5.906 27.149 4.194 13.742 8.967 22.413 13.096 23.79.648.216 2.62.873 5.439-2.517A245.272 245.272 0 0145.88 73.046a1.596 1.596 0 012.304 2.208c-.048.05-4.847 5.067-10.077 11.359-2.477 2.979-4.851 3.853-6.786 3.853zm69.429-13.445a1.596 1.596 0 01-1.322-2.487c14.863-22.055 20.08-48.704 15.612-54.414-5.624-7.186-13.565-10.939-23.604-11.156-7.433-.16-13.341 1.738-14.307 2.069l-.243.099c-.971.305-1.716-.227-1.997-.849a1.6 1.6 0 01.631-2.025c.046-.027.192-.089.429-.176l-.021.006.021-.007c1.641-.601 7.639-2.4 15.068-2.315 11.108.118 20.284 4.401 26.534 12.388 2.957 3.779 2.964 12.485.019 23.887-3.002 11.625-8.651 24.118-15.497 34.277-.306.457-.81.703-1.323.703zm.76 10.21c-2.538 0-4.813-.358-6.175-1.174-1.4-.839-1.667-1.979-1.702-2.584-.382-6.71 3.32-7.878 5.208-8.411-.263-.398-.637-.866-1.024-1.349-1.101-1.376-2.609-3.26-3.771-6.078-.182-.44-.752-1.463-1.412-2.648-3.579-6.418-11.026-19.773-6.242-26.612 2.214-3.165 6.623-4.411 13.119-3.716C97.6 28.837 88.5 10.625 66.907 10.271c-6.494-.108-11.82 1.889-15.822 5.93-8.96 9.049-8.636 25.422-8.631 25.586a1.595 1.595 0 11-3.19.084c-.02-.727-.354-17.909 9.554-27.916C53.455 9.272 59.559 6.96 66.96 7.081c13.814.227 22.706 7.25 27.732 13.101 5.479 6.377 8.165 13.411 8.386 15.759.165 1.746-1.088 2.095-1.341 2.147l-.576.013c-6.375-1.021-10.465-.312-12.156 2.104-3.639 5.201 3.406 17.834 6.414 23.229.768 1.376 1.322 2.371 1.576 2.985.988 2.396 2.277 4.006 3.312 5.3.911 1.138 1.7 2.125 1.982 3.283.131.23 1.99 2.98 13.021.703 2.765-.57 4.423-.083 4.93 1.45.997 3.015-4.597 6.532-7.694 7.97-2.775 1.29-7.204 2.106-11.036 2.106zm-4.696-4.021c.35.353 2.101.962 5.727.806 3.224-.138 6.624-.839 8.664-1.786 2.609-1.212 4.351-2.567 5.253-3.492l-.5.092c-7.053 1.456-12.042 1.262-14.828-.577a6.162 6.162 0 01-.54-.401c-.302.119-.581.197-.78.253-1.58.443-3.214.902-2.996 5.105zm-45.562 8.915c-1.752 0-3.596-.239-5.479-.71-1.951-.488-5.24-1.957-5.19-4.37.057-2.707 3.994-3.519 5.476-3.824 5.354-1.103 5.703-1.545 7.376-3.67.488-.619 1.095-1.39 1.923-2.314 1.229-1.376 2.572-2.073 3.992-2.073.989 0 1.8.335 2.336.558 1.708.708 3.133 2.42 3.719 4.467.529 1.847.276 3.625-.71 5.006-3.237 4.533-7.886 6.93-13.443 6.93zm-7.222-4.943c.481.372 1.445.869 2.518 1.137 1.631.408 3.213.615 4.705.615 4.546 0 8.196-1.882 10.847-5.594.553-.774.387-1.757.239-2.274-.31-1.083-1.08-2.068-1.873-2.397-.43-.178-.787-.314-1.115-.314-.176 0-.712 0-1.614 1.009a41.146 41.146 0 00-1.794 2.162c-2.084 2.646-3.039 3.544-9.239 4.821-1.513.31-2.289.626-2.674.835zm12.269-7.36a1.596 1.596 0 01-1.575-1.354 8.218 8.218 0 01-.08-.799c-4.064-.076-7.985-1.82-10.962-4.926-3.764-3.927-5.477-9.368-4.699-14.927.845-6.037.529-11.366.359-14.229-.047-.796-.081-1.371-.079-1.769.003-.505.013-1.844 4.489-4.113 1.592-.807 4.784-2.215 8.271-2.576 5.777-.597 9.585 1.976 10.725 7.246 3.077 14.228.244 20.521-1.825 25.117-.385.856-.749 1.664-1.04 2.447l-.257.69c-1.093 2.931-2.038 5.463-1.748 7.354a1.595 1.595 0 01-1.335 1.819l-.244.02zM42.464 42.26l.062 1.139c.176 2.974.504 8.508-.384 14.86-.641 4.585.759 9.06 3.843 12.276 2.437 2.542 5.644 3.945 8.94 3.945h.068c.369-1.555.982-3.197 1.642-4.966l.255-.686c.329-.884.714-1.74 1.122-2.646 1.991-4.424 4.47-9.931 1.615-23.132-.565-2.615-1.936-4.128-4.189-4.627-4.628-1.022-11.525 2.459-12.974 3.837zm9.63-.677c-.08.564 1.033 2.07 2.485 2.271 1.449.203 2.689-.975 2.768-1.539.079-.564-1.033-1.186-2.485-1.388-1.451-.202-2.691.092-2.768.656zm2.818 2.826l-.407-.028c-.9-.125-1.81-.692-2.433-1.518-.219-.29-.576-.852-.505-1.354.101-.736.999-1.177 2.4-1.177.313 0 .639.023.967.069.766.106 1.477.327 2.002.62.91.508.977 1.075.936 1.368-.112.813-1.405 2.02-2.96 2.02zm-2.289-2.732c.045.348.907 1.496 2.029 1.651l.261.018c1.036 0 1.81-.815 1.901-1.082-.096-.182-.762-.634-2.025-.81a5.823 5.823 0 00-.821-.059c-.812 0-1.243.183-1.345.282zm43.605-1.245c.079.564-1.033 2.07-2.484 2.272-1.45.202-2.691-.975-2.771-1.539-.076-.564 1.036-1.187 2.486-1.388 1.45-.203 2.689.092 2.769.655zm-2.819 2.56c-1.396 0-2.601-1.086-2.7-1.791-.115-.846 1.278-1.489 2.712-1.688.316-.044.629-.066.93-.066 1.238 0 2.058.363 2.14.949.053.379-.238.964-.739 1.492-.331.347-1.026.948-1.973 1.079l-.37.025zm.943-3.013c-.276 0-.564.021-.856.061-1.441.201-2.301.779-2.259 1.089.048.341.968 1.332 2.173 1.332l.297-.021c.787-.109 1.378-.623 1.66-.919.443-.465.619-.903.598-1.052-.028-.198-.56-.49-1.613-.49zm3.965 32.843a1.594 1.594 0 01-1.324-2.483c3.398-5.075 2.776-10.25 2.175-15.255-.257-2.132-.521-4.337-.453-6.453.07-2.177.347-3.973.614-5.71.317-2.058.617-4.002.493-6.31a1.595 1.595 0 113.186-.172c.142 2.638-.197 4.838-.525 6.967-.253 1.643-.515 3.342-.578 5.327-.061 1.874.178 3.864.431 5.97.64 5.322 1.365 11.354-2.691 17.411a1.596 1.596 0 01-1.328.708z"
    />
  </svg>
);

const RedisIcon = () => (
  <svg
    width="40"
    height="40"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 128 128"
  >
    <path
      fill="#A41E11"
      d="M121.8 93.1c-6.7 3.5-41.4 17.7-48.8 21.6-7.4 3.9-11.5 3.8-17.3 1S13 98.1 6.3 94.9c-3.3-1.6-5-2.9-5-4.2V78s48-10.5 55.8-13.2c7.8-2.8 10.4-2.9 17-.5s46.1 9.5 52.6 11.9v12.5c0 1.3-1.5 2.7-4.9 4.4z"
    />
    <path
      fill="#D82C20"
      d="M121.8 80.5C115.1 84 80.4 98.2 73 102.1c-7.4 3.9-11.5 3.8-17.3 1-5.8-2.8-42.7-17.7-49.4-20.9C-.3 79-.5 76.8 6 74.3c6.5-2.6 43.2-17 51-19.7 7.8-2.8 10.4-2.9 17-.5s41.1 16.1 47.6 18.5c6.7 2.4 6.9 4.4.2 7.9z"
    />
    <path
      fill="#A41E11"
      d="M121.8 72.5C115.1 76 80.4 90.2 73 94.1c-7.4 3.8-11.5 3.8-17.3 1C49.9 92.3 13 77.4 6.3 74.2c-3.3-1.6-5-2.9-5-4.2V57.3s48-10.5 55.8-13.2c7.8-2.8 10.4-2.9 17-.5s46.1 9.5 52.6 11.9V68c0 1.3-1.5 2.7-4.9 4.5z"
    />
    <path
      fill="#D82C20"
      d="M121.8 59.8c-6.7 3.5-41.4 17.7-48.8 21.6-7.4 3.8-11.5 3.8-17.3 1C49.9 79.6 13 64.7 6.3 61.5s-6.8-5.4-.3-7.9c6.5-2.6 43.2-17 51-19.7 7.8-2.8 10.4-2.9 17-.5s41.1 16.1 47.6 18.5c6.7 2.4 6.9 4.4.2 7.9z"
    />
    <path
      fill="#A41E11"
      d="M121.8 51c-6.7 3.5-41.4 17.7-48.8 21.6-7.4 3.8-11.5 3.8-17.3 1C49.9 70.9 13 56 6.3 52.8c-3.3-1.6-5.1-2.9-5.1-4.2V35.9s48-10.5 55.8-13.2c7.8-2.8 10.4-2.9 17-.5s46.1 9.5 52.6 11.9v12.5c.1 1.3-1.4 2.6-4.8 4.4z"
    />
    <path
      fill="#D82C20"
      d="M121.8 38.3C115.1 41.8 80.4 56 73 59.9c-7.4 3.8-11.5 3.8-17.3 1S13 43.3 6.3 40.1s-6.8-5.4-.3-7.9c6.5-2.6 43.2-17 51-19.7 7.8-2.8 10.4-2.9 17-.5s41.1 16.1 47.6 18.5c6.7 2.4 6.9 4.4.2 7.8z"
    />
    <path
      fill="#fff"
      d="M80.4 26.1l-10.8 1.2-2.5 5.8-3.9-6.5-12.5-1.1 9.3-3.4-2.8-5.2 8.8 3.4 8.2-2.7L72 23zM66.5 54.5l-20.3-8.4 29.1-4.4z"
    />
    <ellipse fill="#fff" cx="38.4" cy="35.4" rx="15.5" ry="6" />
    <path fill="#7A0C00" d="M93.3 27.7l17.2 6.8-17.2 6.8z" />
    <path fill="#AD2115" d="M74.3 35.3l19-7.6v13.6l-1.9.8z" />
  </svg>
);

const SupabaseIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 109 113"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z"
      fill="url(#paint0_linear)"
    />
    <path
      d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z"
      fill="url(#paint1_linear)"
      fillOpacity="0.2"
    />
    <path
      d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z"
      fill="#3ECF8E"
    />
    <defs>
      <linearGradient
        id="paint0_linear"
        x1="53.9738"
        y1="54.974"
        x2="94.1635"
        y2="71.8295"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#249361" />
        <stop offset="1" stopColor="#3ECF8E" />
      </linearGradient>
      <linearGradient
        id="paint1_linear"
        x1="36.1558"
        y1="30.578"
        x2="54.4844"
        y2="65.0806"
        gradientUnits="userSpaceOnUse"
      >
        <stop />
        <stop offset="1" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

const TerminalIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient
        id="tBg"
        x1="0"
        y1="0"
        x2="64"
        y2="64"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#c7d9ff" />
        <stop offset="40%" stopColor="#7287fa" />
        <stop offset="100%" stopColor="#3730a3" />
      </linearGradient>
      <radialGradient id="tGl" cx="58%" cy="28%" r="52%">
        <stop offset="0%" stopColor="white" stopOpacity="0.55" />
        <stop offset="60%" stopColor="white" stopOpacity="0.08" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="64" height="64" fill="url(#tBg)" />
    <rect width="64" height="64" fill="url(#tGl)" />
    <path
      d="M17 24 L27 32 L17 40"
      stroke="white"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M30 40 L46 40"
      stroke="white"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
  </svg>
);

import type { ReactElement, ReactNode } from "react";
import HeroGradient from "./HeroGradient";

const avatarClass =
  "flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-full text-[30px] leading-[1]";
const heroTextAreaClass =
  "mx-auto flex min-h-0 w-full max-w-[1400px] items-center justify-center gap-0 px-[24px]";
const heroCenterClass =
  "flex w-full items-center justify-center bg-white [font-family:'Pretendard',-apple-system,sans-serif]";
const heroInnerClass =
  "mt-[120px] flex w-full min-w-0 max-w-[1100px] flex-col items-center text-center";
const headlineClass =
  "m-0 flex w-full max-w-full flex-col items-center gap-[4px] text-[clamp(42px,6vw,76px)] font-extrabold leading-[1.14] tracking-[-0.03em] text-[#191919] [overflow-wrap:break-word] [word-break:keep-all] max-[600px]:text-[40px] max-[600px]:leading-[1.12]";
const headlineSpanClass = "block max-w-full py-[0.04em]";
const headlineLine2Class =
  "mt-[6px] inline-flex flex-wrap items-center justify-center gap-0 text-[clamp(38px,5.2vw,65px)] leading-[1.12] max-[600px]:text-[36px]";
const headlinePillClass =
  "mx-[6px] inline-flex items-center justify-center gap-[5px] rounded-full bg-[#d3e4f7] px-[0.16em] pt-[0.06em] pb-[0.1em] align-middle font-extrabold leading-[1.08] text-[#191919] max-[600px]:mt-[8px]";
const subheadlineClass =
  "mt-[28px] mb-0 text-[20px] font-medium tracking-[-0.01em] text-[#5c5c5c] max-[600px]:text-[16px]";
const uiGradientInnerClass = "w-full rounded-[42px]";
const uiPreviewWrapClass =
  "mx-auto flex w-full max-w-[500px] flex-col items-center gap-[22px]";
const urlBarClass =
  "flex w-[86%] items-center justify-center gap-[10px] rounded-[26px] border border-[rgba(255,255,255,0.6)] bg-[rgba(255,255,255,0.45)] px-[28px] py-[20px] shadow-[0_4px_18px_rgba(80,120,60,0.12)] backdrop-blur-[8px]";
const browserMockupClass =
  "w-full overflow-hidden rounded-t-[38px] border-[7px] border-b-0 border-[#1c2535] bg-white pb-2 shadow-[0_20px_50px_rgba(40,60,30,0.22)]";
const browserContentClass = "flex h-[420px] flex-col px-[10px] pt-[22px] pb-5";
const userMessageRowClass =
  "flex h-[64px] shrink-0 items-start justify-end px-[8px] pb-0";
const userBubbleClass =
  "max-w-[92%] overflow-hidden rounded-[18px_18px_4px_18px] bg-[var(--blue)] px-4 py-3 text-left text-[15px] font-medium text-white";
const aiReplyClass =
  "flex min-h-0 flex-1 flex-col items-start px-[8px] pt-[22px]";
const aiHeaderClass = "mb-2 flex shrink-0 items-center gap-2";
const aiBubbleClass =
  "min-h-[44px] w-fit max-w-[92%] rounded-[4px_18px_18px_18px] bg-[#eef0f2] px-4 py-3";
const answerTextClass =
  "m-0 text-left text-base font-medium leading-[1.7] text-[#2e2e2e]";
const ctaButtonClass =
  "cursor-pointer rounded-[10px] border-0 bg-[#c9d6f0] px-4 py-[11px] text-sm font-semibold text-[#2a3a66] transition-colors duration-150 hover:bg-[#b9c9ec]";
const typingDotClass =
  "h-2 w-2 rounded-full bg-[#9aa1ad] [animation:heroTypingDot_1.1s_ease-in-out_infinite]";

const TYPING_DELAY_MS = 500;
const ANSWER_LINE_DELAY_MS = 550;
const CTA_DELAY_MS = 450;
const HOLD_AFTER_DONE_MS = 1600;

const HERO_SCENARIOS = [
  {
    gradient:
      "linear-gradient(135deg, #38bdf8 0%, #a78bfa 30%, #fb923c 65%, #fbbf24 100%)",
    question: "에어컨에서 냄새 나는데 청소나 수리 가능한가요?",
    answer: [
      "네, 분해 청소와 가스 점검이 함께 진행되는 방문 서비스가 가능합니다.",
      "악취는 대부분 내부 곰팡이나 냄새로 분해 세척하면 해결돼요.",
      "가까운 날짜로 바로 예약해 드릴까요?",
    ],
    cta: "방문 청소 예약하기",
  },
  {
    gradient:
      "linear-gradient(135deg, #09ff00 0%, #fcbcbc 30%, #f870d6 65%, #5dc784 100%)",
    question: "오늘 저녁 6시에 4명 예약되나요?",
    answer: [
      "네, 오늘 18시에 4인 테이블 예약 가능합니다.",
      "창가 자리로 안내드릴까요, 룸 자리도 비어 있어요.",
      "원하시는 자리 알려주시면 바로 확정해 드릴게요.",
    ],
    cta: "예약 확정하기",
  },
  {
    gradient:
      "linear-gradient(135deg, #55ddf5 0%, #e93d3d 30%, #c4eb16 65%, #5dc784 100%)",
    question: "이번 주말에 펌 하려는데 빈 시간 있나요?",
    answer: [
      "토요일은 오후 1시, 일요일은 오전 11시에 가능합니다.",
      "디자이너 지정도 가능하니 원하시는 분 말씀해 주세요.",
      "시술 시간은 약 2시간 정도 소요돼요.",
    ],
    cta: "예약 가능 시간 보기",
  },
];

type AvatarEntry =
  | {
      label: string;
      className: string;
      Icon: IconType;
      color: string;
      custom?: never;
      imgSrc?: never;
    }
  | {
      label: string;
      className: string;
      custom: () => ReactElement;
      Icon?: never;
      color?: never;
      imgSrc?: never;
    }
  | {
      label: string;
      className: string;
      imgSrc: string;
      Icon?: never;
      color?: never;
      custom?: never;
    };

const CALL_BEE_FIXED_PREFIX = "C";
const CALL_BEE_REST = "all bee";
const TYPEWRITER_CHAR_MS = 140;
const TYPEWRITER_HOLD_MS = 2000;
const TYPEWRITER_ERASE_MS = 140;

function CallBeeTypewriter() {
  const [length, setLength] = useState(0);
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    let timer: number;

    if (!erasing && length < CALL_BEE_REST.length) {
      timer = window.setTimeout(() => setLength((n) => n + 1), TYPEWRITER_CHAR_MS);
    } else if (!erasing && length === CALL_BEE_REST.length) {
      timer = window.setTimeout(() => setErasing(true), TYPEWRITER_HOLD_MS);
    } else if (erasing && length > 0) {
      timer = window.setTimeout(() => setLength((n) => n - 1), TYPEWRITER_ERASE_MS);
    } else {
      timer = window.setTimeout(() => setErasing(false), 400);
    }

    return () => window.clearTimeout(timer);
  }, [length, erasing]);

  const isHolding = !erasing && length === CALL_BEE_REST.length;

  return (
    <span className="inline-flex items-center">
      <span className="flex-none">{CALL_BEE_FIXED_PREFIX}</span>
      <span
        className="inline-flex items-center justify-start whitespace-pre"
        style={{ minWidth: `${CALL_BEE_REST.length * 0.72}ch` }}
      >
        {CALL_BEE_REST.slice(0, length)}
        <span
          className={`ml-[1px] inline-block w-[2px] bg-current align-middle ${
            isHolding ? "[animation:heroCursorBlink_0.85s_step-end_infinite]" : ""
          }`}
          style={{ height: "0.9em" }}
        />
      </span>
    </span>
  );
}

type SequenceStep =
  | { phase: "typing" }
  | { phase: "answer"; lineIndex: number; charCount: number }
  | { phase: "cta" }
  | { phase: "done" };

const STREAM_CHAR_MS = 22;
const STREAM_LINE_PAUSE_MS = 350;

export default function Hero() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [step, setStep] = useState<SequenceStep>({ phase: "typing" });

  useEffect(() => {
    const scenario = HERO_SCENARIOS[scenarioIndex];
    const timers: number[] = [];

    if (step.phase === "typing") {
      timers.push(
        window.setTimeout(
          () => setStep({ phase: "answer", lineIndex: 0, charCount: 0 }),
          TYPING_DELAY_MS,
        ),
      );
    } else if (step.phase === "answer") {
      const currentLine = scenario.answer[step.lineIndex] ?? "";
      if (step.charCount < currentLine.length) {
        timers.push(
          window.setTimeout(
            () =>
              setStep({
                phase: "answer",
                lineIndex: step.lineIndex,
                charCount: step.charCount + 1,
              }),
            STREAM_CHAR_MS,
          ),
        );
      } else if (step.lineIndex < scenario.answer.length - 1) {
        timers.push(
          window.setTimeout(
            () =>
              setStep({
                phase: "answer",
                lineIndex: step.lineIndex + 1,
                charCount: 0,
              }),
            STREAM_LINE_PAUSE_MS,
          ),
        );
      } else {
        timers.push(
          window.setTimeout(
            () => setStep({ phase: "cta" }),
            ANSWER_LINE_DELAY_MS,
          ),
        );
      }
    } else if (step.phase === "cta") {
      timers.push(
        window.setTimeout(() => setStep({ phase: "done" }), CTA_DELAY_MS),
      );
    } else {
      timers.push(
        window.setTimeout(() => {
          setScenarioIndex((i) => (i + 1) % HERO_SCENARIOS.length);
          setStep({ phase: "typing" });
        }, HOLD_AFTER_DONE_MS),
      );
    }

    return () => timers.forEach((id) => window.clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, scenarioIndex]);

  const scenario = HERO_SCENARIOS[scenarioIndex];
  const showCta = step.phase === "cta" || step.phase === "done";

  return (
    <section
      className="box-border flex w-full flex-col items-center justify-start bg-white p-0"
      id="hero"
    >
      <style>
        {`
          @keyframes pillDotBlink {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.25; transform: scale(0.8); }
          }

          @keyframes heroMockupTextIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes heroTypingDot {
            0%, 60%, 100% { opacity: 0.3; transform: scale(0.85); }
            30% { opacity: 1; transform: scale(1); }
          }

          @keyframes heroCursorBlink {
            0%, 50% { opacity: 1; }
            50.01%, 100% { opacity: 0; }
          }
        `}
      </style>
      <div className={heroTextAreaClass} />

      <div className={heroCenterClass}>
        <div className={heroInnerClass}>
          {/* Avatar row */}
          <div className="mb-8 flex flex-wrap justify-center gap-2.5">
            {(
              [
                {
                  label: "ChatGPT",
                  className: "border-[3px] border-[#10a37f] bg-white",
                  Icon: SiOpenai,
                  color: "#0d0d0d",
                },
                {
                  label: "Claude",
                  className: "border-[3px] border-[#d97706] bg-[#fdf6ee]",
                  Icon: SiClaude,
                  color: "#d97706",
                },
                {
                  label: "Codex",
                  className: "bg-transparent",
                  custom: TerminalIcon,
                },
                {
                  label: "Supabase",
                  className: "border-[3px] border-[#3ecf8e] bg-[#1c1c1c]",
                  custom: SupabaseIcon,
                },
                {
                  label: "Redis",
                  className: "border-[3px] border-[#dc382d] bg-white",
                  custom: RedisIcon,
                },
                {
                  label: "PostgreSQL",
                  className: "border-[3px] border-[#336791] bg-white",
                  custom: PostgreSQLIcon,
                },
              ] as AvatarEntry[]
            ).map((a, i) => {
              let icon: ReactNode;
              if (a.imgSrc) {
                icon = (
                  <img
                    className="h-10 w-10 object-contain"
                    src={a.imgSrc}
                    alt={a.label}
                  />
                );
              } else if (a.custom) {
                const C = a.custom;
                icon = <C />;
              } else {
                const IC = a.Icon as IconType;
                icon = <IC size={28} color={a.color} aria-label={a.label} />;
              }
              return (
                <div key={i} className={`${avatarClass} ${a.className}`}>
                  {icon}
                </div>
              );
            })}
          </div>

          {/* Headline */}
          <h1 className={headlineClass}>
            <span className={headlineSpanClass}>
              바쁜 일상 속, 놓치는 예약 없이
            </span>
            <span className={headlineLine2Class}>
              상담 에이전트
              <span className={headlinePillClass}>
                <span className="h-[22px] w-[22px] flex-none rounded-full bg-[#2383e2] [animation:pillDotBlink_1.4s_ease-in-out_infinite]" />
                <CallBeeTypewriter />
              </span>
            </span>
          </h1>

          <p className={subheadlineClass}>
            챗봇과 통화로, 실제 비즈니스 환경에서 필요한 기능들을 경험하세요.
          </p>

          {/* Product UI preview */}
          <HeroGradient
            themes={HERO_SCENARIOS.map((s) => s.gradient)}
            activeIndex={scenarioIndex}
          >
            <div className={uiGradientInnerClass}>
              <div className={uiPreviewWrapClass}>
                {/* URL bar */}
                <div className={urlBarClass}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4a4a4a"
                    strokeWidth="1.6"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                  </svg>
                  <span className="text-[19px] font-semibold text-[#2e2e2e]">
                    callbee.com
                  </span>
                </div>

                {/* Browser mockup */}
                <div className={browserMockupClass}>
                  <div className={browserContentClass}>
                    {/* User message */}
                    <div className={userMessageRowClass}>
                      <div
                        key={`q-${scenarioIndex}`}
                        className={`${userBubbleClass} [animation:heroMockupTextIn_0.35s_ease-out]`}
                      >
                        {scenario.question}
                      </div>
                    </div>

                    {/* AI reply */}
                    <div className={aiReplyClass}>
                      <div className={aiHeaderClass}>
                        <span className="rounded-[5px] border border-[#c7ccd2] px-1.5 py-0.5 text-[11px] font-bold text-[#1c2535]">
                          Callbee
                        </span>
                      </div>

                      <div className={aiBubbleClass}>
                        <div className={answerTextClass}>
                          {step.phase === "typing" ? (
                            <div className="flex min-h-[1.7em] items-center gap-1.5">
                              <span
                                className={typingDotClass}
                                style={{ animationDelay: "0ms" }}
                              />
                              <span
                                className={typingDotClass}
                                style={{ animationDelay: "150ms" }}
                              />
                              <span
                                className={typingDotClass}
                                style={{ animationDelay: "300ms" }}
                              />
                            </div>
                          ) : step.phase === "answer" ? (
                            scenario.answer
                              .slice(0, step.lineIndex + 1)
                              .map((line, idx) => (
                                <span key={line} className="block">
                                  {idx === step.lineIndex
                                    ? line.slice(0, step.charCount)
                                    : line}
                                </span>
                              ))
                          ) : (
                            scenario.answer.map((line) => (
                              <span key={line} className="block">
                                {line}
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="mt-[18px] h-[44px] shrink-0">
                        {showCta && (
                          <button
                            className={`${ctaButtonClass} [animation:heroMockupTextIn_0.35s_ease-out]`}
                          >
                            {scenario.cta}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </HeroGradient>
        </div>
      </div>
    </section>
  );
}
