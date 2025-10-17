#pragma once
#ifndef ZIPIOS_CONFIG_HPP
#define ZIPIOS_CONFIG_HPP

/*
  Zipios -- a small C++ library that provides easy access to .zip files.

  Copyright (C) 2000-2007  Thomas Sondergaard
  Copyright (c) 2015-2022  Made to Order Software Corp.  All Rights Reserved

  This library is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation; either
  version 2.1 of the License, or (at your option) any later version.

  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with this library; if not, write to the Free Software
  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
*/

/** \file
 * \brief zipios configuration header.
 *
 * Various configuration parameters, all of which are defined using
 * system specific \#ifdef and similar preprocessor tests.
 *
 * This file also includes some general information such as the library
 * version and common functions and types that are public.
 */

#include <sys/stat.h>

#include <iostream>

#include <stdio.h>

#define ZIPIOS_VERSION_MAJOR 2
#define ZIPIOS_VERSION_MINOR 3
#define ZIPIOS_VERSION_PATCH 4
#define ZIPIOS_VERSION_STRING "2.3.4"

namespace zipios {

inline char const *getVersion() { return ZIPIOS_VERSION_STRING; }

typedef std::streamoff offset_t;

inline size_t getBufferSize() { return BUFSIZ; }

} // namespace zipios

// Visual C++
#ifdef _MSC_VER

// Disable class-browser warning about truncated template-names
// Still needed? TBD
// #pragma warning( disable : 4786 )

#endif //_MSC_VER

// #ifdef WIN32

// // Needed for FilePath
// #define S_ISREG(mode)   (((mode) & _S_IFREG) == _S_IFREG)
// #define S_ISDIR(mode)   (((mode) & _S_IFDIR) == _S_IFDIR)
// #define S_ISCHR(mode)   (((mode) & _S_IFCHR) == _S_IFCHR)
// #define S_ISBLK(mode)   0
// #define S_ISSOCK(mode)  0
// #define S_ISFIFO(mode)  (((mode) & _S_IFIFO) == _S_IFIFO)

// // todo: change to _stat64 or whatever is required to get full 64 bit support
// typedef struct stat     os_stat_t;

// #else

// typedef struct stat     os_stat_t;

// #endif

// Windows (both MSVC and MinGW/Clang)
#ifdef _WIN32

// Define S_IS* only if missing. Choose the right base constants.
#ifndef S_ISREG
#ifdef _S_IFREG
#define S_ISREG(m) (((m) & _S_IFMT) == _S_IFREG)
#else
#define S_ISREG(m) (((m) & S_IFMT) == S_IFREG)
#endif
#endif

#ifndef S_ISDIR
#ifdef _S_IFDIR
#define S_ISDIR(m) (((m) & _S_IFMT) == _S_IFDIR)
#else
#define S_ISDIR(m) (((m) & S_IFMT) == S_IFDIR)
#endif
#endif

#ifndef S_ISCHR
#ifdef _S_IFCHR
#define S_ISCHR(m) (((m) & _S_IFMT) == _S_IFCHR)
#else
#define S_ISCHR(m) (((m) & S_IFMT) == S_IFCHR)
#endif
#endif

// These are often not meaningful on Windows. Define only if absent.
#ifndef S_ISBLK
#define S_ISBLK(m) 0
#endif

#ifndef S_ISSOCK
#define S_ISSOCK(m) 0
#endif

#ifndef S_ISFIFO
#ifdef _S_IFIFO
#define S_ISFIFO(m) (((m) & _S_IFMT) == _S_IFIFO)
#else
#define S_ISFIFO(m) (((m) & S_IFMT) == S_IFIFO)
#endif
#endif

// Pick an os_stat_t that matches the compiler
#ifdef _MSC_VER
typedef struct _stat64 os_stat_t; // MSVC: 64-bit sizes/times
#else
typedef struct stat os_stat_t; // MinGW/Clang
#endif

#else
  // Non-Windows: just use POSIX
typedef struct stat os_stat_t;
#endif

// vim: ts=4 sw=4 et
#endif
