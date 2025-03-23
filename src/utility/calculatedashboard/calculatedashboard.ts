interface FileMetadata {
  _id: string;
  userId: string;
  folderlock: string;
  mimetype: string;
  filepath: string;
  filesize: number;
  isFavourit: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  folderId?: {
    _id: string;
    foldername: string;
    userId: string;
    folderlock: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

interface DashboardResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPage: number;
    };
    files: FileMetadata[];
  };
}

interface FolderInfo {
  name: string;
  count: number;
}

function calculateUserStorageMetrics(response: DashboardResponse) {
  const { files } = response.data;

  const totalStorageBytes = files.reduce((acc, file) => acc + file.filesize, 0);
  const totalStorageGB = totalStorageBytes / (1024 * 1024 * 1024);

  const uniqueFolderIds = new Set();
  files.forEach((file) => {
    if (file.folderId) {
      uniqueFolderIds.add(file.folderId._id);
    }
  });
  const totalFolders = uniqueFolderIds.size;

  const fileTypeBreakdown = files.reduce(
    (acc, file) => {
      const fileType =
        file.mimetype.split('/')[0] === 'application'
          ? file.mimetype.split('/')[1]
          : file.mimetype.split('/')[0];

      if (!acc[fileType]) {
        acc[fileType] = {
          count: 0,
          sizeBytes: 0,
        };
      }

      acc[fileType].count++;
      acc[fileType].sizeBytes += file.filesize;

      return acc;
    },
    {} as Record<string, { count: number; sizeBytes: number }>,
  );

  const fileTypeMetrics = Object.keys(fileTypeBreakdown).map((type) => {
    return {
      type,
      count: fileTypeBreakdown[type].count,
      sizeGB: fileTypeBreakdown[type].sizeBytes / (1024 * 1024 * 1024),
    };
  });

  const lockedFiles = files.filter((file) => file.folderlock === 'YES').length;
  const unlockedFiles = files.filter((file) => file.folderlock === 'NO').length;

  return {
    userId: files[0]?.userId,
    totalFiles: files.length,
    
    totalStorageGB,
    totalFolders,
    fileTypeMetrics,
    security: {
      lockedFiles,
      unlockedFiles,
    },
  };
}

function getStorageAndFolderCounts(response: DashboardResponse) {
  const { files } = response.data;

  const totalStorageBytes = files.reduce((acc, file) => acc + file.filesize, 0);
  const totalStorageGB = totalStorageBytes / (1024 * 1024 * 1024)

  const folderFileCount: Record<string, FolderInfo> = {};

  files.forEach((file) => {
    if (file.folderId) {
      const folderId = file.folderId._id;
      const folderName = file.folderId.foldername;

      if (!folderFileCount[folderId]) {
        folderFileCount[folderId] = {
          name: folderName,
          count: 0,
        };
      }

      folderFileCount[folderId].count++;
    }
  });

  return {
    totalStorageGB,
    foldersWithFileCount: Object.values(folderFileCount),
  };
}

const calculatedashboard = {
  calculateUserStorageMetrics,
  getStorageAndFolderCounts,
};

export default calculatedashboard;
